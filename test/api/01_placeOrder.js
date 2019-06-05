const constant = require('../constants')
    , chai = require('chai')
    , ajv = new (require('ajv'))
    , utility = require('./utility')
;

chai.use(require('chai-http'));
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));

const expect = chai.expect;
const expected = {
    currency: 'HKD',
    priceCompareThreshold: 0.01,
    rates: {
        normal: {
            minimum: {metre: 2000, fare: 20},
            additional: {metre: 200, fare: 5},
            time: {
                from: {hour: 5, minute: 0, second: 0},
                to: {hour: 21, minute: 59, second: 59}
            }
        },
        lateNight: {
            minimum: {metre: 2000, fare: 30},
            additional: {metre: 200, fare: 8},
            time: {
                from: {hour: 22, minute: 0, second: 0},
                to: {hour: 4, minute: 59, second: 59}
            }
        },
    }
};

const stops = {
    two: [constant.place.centralStn, constant.place.tstStn],
    three: [constant.place.kwaiChung8ContainerPort, constant.place.taiWaiTransportCityBldg, constant.place.shaTinGovOffices]
};

describe('01. Place Order (POST /orders)', function () {
    let createdOrderID;

    afterEach(function (done) {
        utility.cancelLastSuccessfullyPlacedOrder(_ => {
            done();
        });
    });

    describe('Verify data schema', function () {
        const validatePlaceOrderJSON = ajv.compile(require('../schema/01_placeOrder.schema'));

        let expectValidPlaceOrder = res => {
            expect(res).to.have.status(201);
            let isValidJSON = validatePlaceOrderJSON(res.body);
            let errors = (isValidJSON) ? null : JSON.stringify(validatePlaceOrderJSON.errors);
            expect(isValidJSON, errors).to.be.true;
        };

        it('should return 201 & valid JSON for immediate order', function (done) {
            utility.placeOrderNow(
                stops.two,
                res => {
                    expectValidPlaceOrder(res);
                    createdOrderID = res.body.id;
                    done();
                });
        });

        it('should return 201 & valid JSON for advanced order', function (done) {
            utility.placeOrderLater(
                stops.two,
                utility.getISOTimeNextDay(0, 0, 0),
                res => {
                    expectValidPlaceOrder(res);
                    createdOrderID = res.body.id;
                    done();
                });
        });
    });

    describe('Verify price', function () {
        let tests = [
            {fareType: 'normal', second: 'first', orderTime: expected.rates.normal.time.from, isLateNight: false}
            , {fareType: 'normal', second: 'last', orderTime: expected.rates.normal.time.to, isLateNight: false}
            , {
                fareType: 'late night',
                second: 'first',
                orderTime: expected.rates.lateNight.time.from,
                isLateNight: true
            }
            , {fareType: 'late night', second: 'last', orderTime: expected.rates.lateNight.time.to, isLateNight: true}
        ];

        tests.forEach(function (test) {
            it(`should return correct ${test.fareType} fare in the ${test.second} second`, function (done) {
                utility.placeOrderLater(
                    stops.three,
                    utility.getISOTimeNextDay(test.orderTime.hour, test.orderTime.minute, test.orderTime.second),
                    res => {
                        let totalDistance = res.body.drivingDistancesInMeters.reduce((sum, meters) => sum + meters, 0);
                        let actualFare = Number.parseFloat(res.body.fare.amount);
                        let rates = test.isLateNight ? expected.rates.lateNight : expected.rates.normal;

                        let startingFare = rates.minimum.fare;
                        let additionalMetre = totalDistance - rates.minimum.metre;
                        let additionalFare = Math.max(0, additionalMetre / rates.additional.metre * rates.additional.fare);

                        let expectedFare = startingFare + additionalFare;
                        let difference = Math.abs(expectedFare - actualFare);

                        expect(difference).to.be.lessThan(expected.priceCompareThreshold);
                        done();
                    }
                );
            });
        });
    });

    describe.only('Verify invalid inputs', function () {
        const validateErrorJSON = ajv.compile(require('../schema/99_error.schema'));
        it('should not accept advanced order in the past', function (done) {
            utility.placeOrderLater(
                stops.two,
                utility.getISOTimeOffsetFromPresent(-1, 'minute'),
                res => {
                    expect(res).to.have.status(400);
                    let isValidJSON = validateErrorJSON(res.body);
                    let errors = (isValidJSON) ? null : JSON.stringify(validateErrorJSON.errors);
                    expect(isValidJSON, errors).to.be.true;
                    done();
                }
            );
        });
    });
});
