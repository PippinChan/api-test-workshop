const config = require('../config');
const chai = require('chai');
chai.use(require('chai-http'));

const util = require('./util');
const validator = require('../schema/JSONValidator');
const places = require('../data/places');
const fares = require('../data/fares.HK');
const error = require('../data/errorMessages');

const expect = chai.expect;

const stops = {
    zero: [],
    one: [places.kwunTongStn],
    two: [places.centralStn, places.tstStn],
    two_near: [places.mongKokStn, places.tstStn],
    three: [places.kwaiChung8ContainerPort, places.taiWaiTransportCityBldg, places.shaTinGovOffices],
    fromMacau: [places.studioCityMacau, places.tuenMunStn],
    intoTheSea: [places.mongKokStn, places.southChinaSea],
    fromTheSea: [places.southChinaSea, places.mongKokStn]
};

describe('01. Place Order (POST /orders)', function () {

    let newPostRequest = () => util.newRequest().post(config.apiPlaceOrder);

    describe('Verify data schema', function () {
        let tests = [
            {
                desc: 'immediate order',
                request: newPostRequest().send({
                    stops: stops.two
                }),
                expected: {
                    statusCode: 201,
                    schema: validator.PLACE_ORDER_SCHEMA
                }
            },
            {
                desc: 'advanced order',
                request: newPostRequest().send({
                    stops: stops.two,
                    orderAt: util.getISOTimeNextDay({hour: 0, minute: 0, second: 0})
                }),
                expected: {
                    statusCode: 201,
                    schema: validator.PLACE_ORDER_SCHEMA
                }
            }
        ];

        tests.forEach(test => {
            it(`should return 201 & valid JSON for ${test.desc}`, function (done) {
                test.request.end((err, res) => {
                    expect(err).to.be.null;
                    validator.validateResponse({
                        response: res,
                        status: test.expected.statusCode,
                        schema: test.expected.schema
                    });
                    done();
                });
            });
        });
    });

    describe('Verify fare', function () {
        let tests = [
            {
                desc: 'order in normal time, first second',
                stops: stops.three,
                orderTime: fares.normal.time.from,
                isLateNight: false
            },
            {
                desc: 'order in normal time, last second',
                stops: stops.three,
                orderTime: fares.normal.time.to,
                isLateNight: false
            },
            {
                desc: 'order in normal time, minimum fare',
                stops: stops.two_near,
                orderTime: fares.normal.time.to,
                isLateNight: false
            },
            {
                desc: 'order in late night time, first second',
                stops: stops.three,
                orderTime: fares.lateNight.time.from,
                isLateNight: true
            },
            {
                desc: 'order in late night time, last second',
                stops: stops.three,
                orderTime: fares.lateNight.time.to,
                isLateNight: true
            },
            {
                desc: 'order in late night time, minimum fare',
                stops: stops.two_near,
                orderTime: fares.lateNight.time.to,
                isLateNight: true
            }
        ];

        tests.forEach(test => {
            it(`should return correct fare for ${test.desc}`, function (done) {
                util.placeOrderLater({
                    stops: test.stops,
                    orderAt: util.getISOTimeNextDay(test.orderTime),
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
                desc: 'GET request',
                request: util.newRequest().get(config.apiPlaceOrder),
                expected: {
                    schema: validator.EMPTY_SCHEMA,
                    error: error.methodNotAllowed
                }
            },
            {
                desc: 'PUT request',
                request: util.newRequest().put(config.apiPlaceOrder),
                expected: {
                    schema: validator.EMPTY_SCHEMA,
                    error: error.methodNotAllowed
                }
            },
            {
                desc: 'PATCH request',
                request: util.newRequest().patch(config.apiPlaceOrder),
                expected: {
                    schema: validator.EMPTY_SCHEMA,
                    error: error.methodNotAllowed
                }
            },
            {
                desc: 'DELETE request',
                request: util.newRequest().delete(config.apiPlaceOrder),
                expected: {
                    schema: validator.EMPTY_SCHEMA,
                    error: error.methodNotAllowed
                }
            },
            {
                desc: 'blank POST payload',
                request: newPostRequest().send(''),
                expected: {
                    schema: validator.ERROR_SCHEMA,
                    error: error.badRequest
                }
            },
            {
                desc: '0 stops',
                request: newPostRequest().send({
                    stops: stops.zero
                }),
                expected: {
                    schema: validator.ERROR_SCHEMA,
                    error: error.stopsError
                }
            },
            {
                desc: '1 stop',
                request: newPostRequest().send({
                    stops: stops.one
                }),
                expected: {
                    schema: validator.ERROR_SCHEMA,
                    error: error.stopsError
                }
            },
            {
                desc: 'advanced order in the past',
                request: newPostRequest().send({
                    stops: stops.two,
                    orderAt: util.getISOTimeOffsetFromPresent({amount: -1, unit: 'minute'})
                }),
                expected: {
                    schema: validator.ERROR_SCHEMA,
                    error: error.orderBehindPresentTime
                }
            },
            {
                desc: 'to pickup from outside Hong Kong',
                request: newPostRequest().send({
                    stops: stops.fromMacau
                }),
                expected: {
                    schema: validator.ERROR_SCHEMA,
                    error: error.serviceUnavailable
                }
            },
            // @pippinchan:
            // I think the 2 cases below should be 503 instead of 201. Hence I will leave them failing for now.
            {
                desc: 'to deliver into the sea',
                request: newPostRequest().send({
                    stops: stops.intoTheSea
                }),
                expected: {
                    schema: validator.ERROR_SCHEMA,
                    error: error.serviceUnavailable
                }
            },
            {
                desc: 'to pickup from the sea',
                request: newPostRequest().send({
                    stops: stops.fromTheSea
                }),
                expected: {
                    schema: validator.ERROR_SCHEMA,
                    error: error.serviceUnavailable
                }
            }
        ];

        tests.forEach(test => {
            it(`should not accept ${test.desc}`, function (done) {
                test.request.end((err, res) => {
                    expect(err).to.be.null;
                    validator.validateResponse({
                        response: res,
                        status: test.expected.error.statusCode,
                        schema: test.expected.schema
                    });
                    if (test.expected.error.message !== undefined)
                        expect(res.body.message).to.equal(test.expected.error.message);
                    done();
                });
            });
        });
    });
});
