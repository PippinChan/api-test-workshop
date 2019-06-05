const chai = require('chai');
const utility = require('./utility');
const validator = require('../schema/JSONValidator');
const places = require('../data/places');
const fares = require('../data/fares.HK');
const error = require('../data/errorMessages');

chai.use(require('chai-http'));
const expect = chai.expect;

const stops = {
    two: [places.centralStn, places.tstStn],
    three: [places.kwaiChung8ContainerPort, places.taiWaiTransportCityBldg, places.shaTinGovOffices],
    fromMacau: [places.studioCityMacau, places.tuenMunStn],
    intoTheSea: [places.mongKokStn, places.southChinaSea]
};

describe('01. Place Order (POST /orders)', function () {
    let cancelLastSuccessfullyPlacedOrder = function (done) {
        utility.cancelLastSuccessfullyPlacedOrder({
            callback: () => {
                done();
            }
        });
    };

    describe('Verify data schema', function () {
        afterEach(cancelLastSuccessfullyPlacedOrder);
        let tests = [
            {
                input: 'immediate order',
                apiFunction: utility.placeOrderNow,
                options: {
                    stops: stops.two
                },
                expected: {
                    status: 201,
                    schema: validator.validatePlaceOrder
                },
            },
            {
                input: 'advanced order',
                apiFunction: utility.placeOrderLater,
                options: {
                    stops: stops.two,
                    orderAt: utility.getISOTimeNextDay({hour: 0, minute: 0, second: 0})
                },
                expected: {
                    status: 201,
                    schema: validator.validatePlaceOrder
                },
            }
        ];

        tests.forEach(test => {
            it(`should return 201 & valid JSON for ${test.input}`, function (done) {
                test.options.callback = resp => {
                    validator.validateAPIResponse({
                        res: resp,
                        expectedStatus: test.expected.status,
                        schemaValidator: test.expected.schema
                    });
                    done();
                };
                test.apiFunction(test.options);
            });
        });
    });

    describe('Verify fare', function () {
        afterEach(cancelLastSuccessfullyPlacedOrder);

        let tests = [
            {fareType: 'normal', second: 'first', orderTime: fares.normal.time.from, isLateNight: false},
            {fareType: 'normal', second: 'last', orderTime: fares.normal.time.to, isLateNight: false},
            {fareType: 'late night', second: 'first', orderTime: fares.lateNight.time.from, isLateNight: true},
            {fareType: 'late night', second: 'last', orderTime: fares.lateNight.time.to, isLateNight: true}
        ];

        tests.forEach(test => {
            it(`should return correct ${test.fareType} fare in the ${test.second} second`, function (done) {
                utility.placeOrderLater({
                    stops: stops.three,
                    orderAt: utility.getISOTimeNextDay(test.orderTime),
                    callback: res => {
                        let totalDistance = res.body.drivingDistancesInMeters.reduce((sum, meters) => sum + meters, 0);
                        let actualFare = Number.parseFloat(res.body.fare.amount);
                        let rates = test.isLateNight ? fares.lateNight : fares.normal;

                        let startingFare = rates.minimum.fare;
                        let additionalMetre = totalDistance - rates.minimum.metre;
                        let additionalFare = Math.max(0, additionalMetre / rates.additional.metre * rates.additional.fare);

                        let expectedFare = startingFare + additionalFare;
                        let difference = Math.abs(expectedFare - actualFare);

                        expect(difference).to.be.lessThan(fares.priceCompareThreshold);
                        done();
                    }
                });
            });
        });
    });

    describe('Verify invalid inputs', function () {
        let tests = [
            {
                input: 'advanced order in the past',
                apiFunction: utility.placeOrderLater,
                options: {
                    stops: stops.two,
                    orderAt: utility.getISOTimeOffsetFromPresent({amount: -1, unit: 'minute'})
                },
                expected: {
                    error: error.orderBehindPresentTime,
                    schema: validator.validateError
                }
            },
            {
                input: 'to pickup from outside Hong Kong',
                apiFunction: utility.placeOrderNow,
                options: {
                    stops: stops.fromMacau
                },
                expected: {
                    error: error.serviceUnavailable,
                    schema: validator.validateError
                }
            },
            // @pippinchan:
            // I think the below case should be 503 instead of 201
            // hence, I will keep this case failing.
            {
                input: 'to deliver into the sea',
                apiFunction: utility.placeOrderNow,
                options: {
                    stops: stops.intoTheSea
                },
                expected: {
                    error: error.serviceUnavailable,
                    schema: validator.validateError
                }
            }
        ];

        tests.forEach(test => {
            it(`should not accept ${test.input}`, function (done) {
                test.options.callback = resp => {
                    validator.validateAPIResponse({
                        res: resp,
                        expectedStatus: test.expected.error.status,
                        schemaValidator: test.expected.schema
                    });
                    expect(resp.body.message).to.equal(test.expected.error.message);
                    done();
                };
                test.apiFunction(test.options);
            });
        });
    });
});
