const config = require('../config');
const chai = require('chai');
chai.use(require('chai-http'));

const util = require('./util');
const stops = util.stops;

const validator = require('../schema/JSONValidator');
const rules = require('../data/rules.HK');
const error = require('../data/errorMessages');

const expect = chai.expect;

describe('01. Place Order (POST /orders)', function () {
  // @pippinchan: Current Lalamove site accepts maximum of 20 stops
  let numberOfTooManyStops = rules.maximumStops + 1;
  let tooManyStops = [];
  for (let i = 0; i < numberOfTooManyStops; i++) tooManyStops.push(util.stops.three[i % 3]);

  let tests = {
    verifySchema: [
      {
        desc: 'immediate order',
        data: {stops: stops.two},
        expected: {statusCode: 201, schema: validator.PLACE_ORDER_SCHEMA}
      },
      {
        desc: 'advanced order',
        data: {stops: stops.two, orderAt: util.getISOTimeNextDay({h: 0, m: 0, s: 0})},
        expected: {statusCode: 201, schema: validator.PLACE_ORDER_SCHEMA}
      }
    ],
    verifyFare: [
      {
        desc: 'order in normal time, first second',
        data: {stops: stops.three, orderAt: util.getISOTimeNextDay(rules.normal.time.from)},
        expected: {isLateNightFare: false}
      },
      {
        desc: 'order in normal time, last second',
        data: {stops: stops.three, orderAt: util.getISOTimeNextDay(rules.normal.time.to)},
        expected: {isLateNightFare: false}
      },
      {
        desc: 'order in normal time, minimum fare',
        data: {stops: stops.twoNear, orderAt: util.getISOTimeNextDay(rules.normal.time.from)},
        expected: {isLateNightFare: false}
      },
      {
        desc: 'order in late night time, first second',
        data: {stops: stops.three, orderAt: util.getISOTimeNextDay(rules.lateNight.time.from)},
        expected: {isLateNightFare: true}
      },
      {
        desc: 'order in late night time, last second',
        data: {stops: stops.three, orderAt: util.getISOTimeNextDay(rules.lateNight.time.to)},
        expected: {isLateNightFare: true}
      },
      {
        desc: 'order in late night time, minimum fare',
        data: {stops: stops.twoNear, orderAt: util.getISOTimeNextDay(rules.lateNight.time.from)},
        expected: {isLateNightFare: true}
      }
    ],
    verifyNegativeInput: [
      {
        desc: 'GET request',
        verb: util.VERB_GET,
        expected: {error: error.general.methodNotAllowed, schema: validator.EMPTY_SCHEMA}
      },
      {
        desc: 'PUT request',
        verb: util.VERB_PUT,
        expected: {error: error.general.methodNotAllowed, schema: validator.EMPTY_SCHEMA}
      },
      {
        desc: 'PATCH request',
        verb: util.VERB_PATCH,
        expected: {error: error.general.methodNotAllowed, schema: validator.EMPTY_SCHEMA}
      },
      {
        desc: 'DELETE request',
        verb: util.VERB_DELETE,
        expected: {error: error.general.methodNotAllowed, schema: validator.EMPTY_SCHEMA}
      },
      { // @pippinchan: FIXME: Missing error message
        desc: '[FAIL] blank POST payload',
        verb: util.VERB_POST,
        data: '',
        expected: {error: error.general.blankPOSTPayload, schema: validator.ERROR_SCHEMA}
      },
      {
        desc: 'empty JSON',
        verb: util.VERB_POST,
        data: {},
        expected: {error: error.placeOrder.errorStops, schema: validator.ERROR_SCHEMA}
      },
      {
        desc: 'missing required field (stops)',
        verb: util.VERB_POST,
        data: {stopz: stops.zero},
        expected: {error: error.placeOrder.errorStops, schema: validator.ERROR_SCHEMA}
      },
      {
        desc: 'no stops',
        verb: util.VERB_POST,
        data: {stops: stops.zero},
        expected: {error: error.placeOrder.errorStops, schema: validator.ERROR_SCHEMA}
      },
      {
        desc: '1 stop',
        verb: util.VERB_POST,
        data: {stops: stops.one},
        expected: {error: error.placeOrder.errorStops, schema: validator.ERROR_SCHEMA}
      },
      { // @pippinchan: FIXME: API allows too many stops
        desc: `[FAIL] ${numberOfTooManyStops} stops`,
        verb: util.VERB_POST,
        data: {stops: tooManyStops},
        expected: {error: error.placeOrder.errorStops, schema: validator.ERROR_SCHEMA}
      },
      { // @pippinchan: FIXME: Missing error message
        desc: '[FAIL] stops not being an array',
        verb: util.VERB_POST,
        data: {stops: '555'},
        expected: {error: error.placeOrder.errorStops, schema: validator.ERROR_SCHEMA}
      },
      { // @pippinchan: FIXME: This input might be acceptable because both lat, lng are still there
        desc: '[FAIL] stops having invalid GPS coordinate in the array (not a lat-lng object)',
        verb: util.VERB_POST,
        data: {stops: [util.stops.three[0], {lat: 22.312291, lng: 114.226255, wrong: 114.226255}, util.stops.three[1]]},
        expected: {error: error.placeOrder.errorStops, schema: validator.ERROR_SCHEMA}
      },
      {
        desc: 'stops having invalid GPS coordinate in the array (missing lat)',
        verb: util.VERB_POST,
        data: {stops: [util.stops.three[0], {lrat: 22.5, lng: 22.2}, util.stops.three[1]]},
        expected: {error: error.placeOrder.errorLng, schema: validator.ERROR_SCHEMA}
      },
      {
        desc: 'stops having invalid GPS coordinate in the array (missing lng)',
        verb: util.VERB_POST,
        data: {stops: [util.stops.three[0], {lat: 22.5, long: 22.2}, util.stops.three[1]]},
        expected: {error: error.placeOrder.lngError, schema: validator.ERROR_SCHEMA}
      },
      {
        desc: 'stops having invalid GPS coordinate in the array (missing lat, lng)',
        verb: util.VERB_POST,
        data: {stops: [util.stops.three[0], {wrat: 22.5, wrong: 22.2}, util.stops.three[1]]},
        expected: {error: error.placeOrder.errorLatLng, schema: validator.ERROR_SCHEMA}
      },
      {
        desc: 'to pickup from outside Hong Kong',
        verb: util.VERB_POST,
        data: {stops: stops.fromMacau},
        expected: {error: error.general.serviceUnavailable, schema: validator.ERROR_SCHEMA}
      },
      { // @pippinchan: FIXME: Should not accept impossible locations
        desc: '[FAIL] to deliver into the sea',
        verb: util.VERB_POST,
        data: {stops: stops.intoTheSea},
        expected: {error: error.general.serviceUnavailable, schema: validator.ERROR_SCHEMA}
      },
      { // @pippinchan: FIXME: Should not accept impossible locations
        desc: '[FAIL] to pickup from the sea',
        verb: util.VERB_POST,
        data: {stops: stops.fromTheSea},
        expected: {error: error.general.serviceUnavailable, schema: validator.ERROR_SCHEMA}
      },
      { // @pippinchan: FIXME: Missing error message
        desc: '[FAIL] orderAt is blank in advanced order',
        verb: util.VERB_POST,
        data: {stops: stops.two, orderAt: ''},
        expected: {error: error.placeOrder.errorOrderAt, schema: validator.ERROR_SCHEMA}
      },
      { // @pippinchan: FIXME: Missing error message
        desc: '[FAIL] orderAt is not a string in advanced order',
        verb: util.VERB_POST,
        data: {stops: stops.two, orderAt: 5555},
        expected: {error: error.placeOrder.errorOrderAt, schema: validator.ERROR_SCHEMA}
      },
      { // @pippinchan: FIXME: Missing error message
        desc: '[FAIL] orderAt is not a valid ISO timestamp in advanced order',
        verb: util.VERB_POST,
        data: {stops: stops.two, orderAt: '5555'},
        expected: {error: error.placeOrder.errorOrderAt, schema: validator.ERROR_SCHEMA}
      },
      { // @pippinchan: FIXME: Missing error message
        desc: '[FAIL] orderAt cannot be parsed to correct time in advanced order',
        verb: util.VERB_POST,
        data: {stops: stops.two, orderAt: '2019-06-11T25:30:08Z'},
        expected: {error: error.placeOrder.errorOrderAt, schema: validator.ERROR_SCHEMA}
      },
      {
        desc: 'advanced order in the past',
        verb: util.VERB_POST,
        data: {stops: stops.two, orderAt: util.getISOTimeFromPresent({amount: -1, unit: 'minute'})},
        expected: {error: error.placeOrder.orderBehindPresentTime, schema: validator.ERROR_SCHEMA}
      }
    ]
  };

  describe('Verify schema', function () {
    let tc = 1;
    tests.verifySchema.forEach(function (test) {
      it(`${tc++}. should return ${test.expected.statusCode} & valid JSON for ${test.desc}`, async function () {
        let res = await util.sendRequest({
          mocha: this,
          title: util.SEQ_PLACE,
          server: config.sampleAPI.server,
          endpoint: config.sampleAPI.placeOrder,
          verb: util.VERB_POST,
          data: test.data
        });
        validator.validateResponse({
          response: res, schema: test.expected.schema, status: test.expected.statusCode
        });
      });
    });
  });

  describe('Verify fare', function () {
    let tc = 1;
    tests.verifyFare.forEach(function (test) {
      it(`${tc++}. should return correct fare for ${test.desc}`, async function () {
        let res = await util.sendRequest({
          mocha: this,
          title: util.SEQ_PLACE,
          server: config.sampleAPI.server,
          endpoint: config.sampleAPI.placeOrder,
          verb: util.VERB_POST,
          data: test.data,
        });
        let totalDistance = res.body.drivingDistancesInMeters.reduce((sum, meters) => sum + meters, 0);
        let actualFare = Number.parseFloat(res.body.fare.amount);
        let rates = test.expected.isLateNightFare ? rules.lateNight : rules.normal;
        let startingFare = rates.minimum.fare;
        let additionalMetre = totalDistance - rates.minimum.metre;
        let additionalFare = Math.max(0, additionalMetre / rates.additional.metre * rates.additional.fare);
        let expectedFare = startingFare + additionalFare;
        let difference = Math.abs(expectedFare - actualFare);
        expect(difference, '(a potential fare discrepancy detected)').to.be.lessThan(rules.priceCompareThreshold);
      });
    });
  });

  describe('Verify negative input', function () {
    let tc = 1;
    tests.verifyNegativeInput.forEach(function (test) {
      it(`${tc++}. should not accept ${test.desc}`, async function () {
        let res = await util.sendRequest({
          mocha: this,
          title: util.SEQ_PLACE,
          server: config.sampleAPI.server,
          endpoint: config.sampleAPI.placeOrder,
          verb: test.verb,
          data: test.data
        });
        util.validateErrorResponse({
          response: res, schema: test.expected.schema, status: test.expected.error.statusCode,
          errorMessage: test.expected.error.message
        });
      });
    });
  });
});

