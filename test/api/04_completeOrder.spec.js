const config = require('../config');
const chai = require('chai');
chai.use(require('chai-http'));

const util = require('./util');

const validator = require('../schema/JSONValidator');
const error = require('../data/errorMessages');

const expect = chai.expect;

describe('04. Complete Order (PUT /orders/{orderID}/complete)', function () {
  let tests = {
    verifyValidFlows: [
      {
        sequence: [util.SEQ_PLACE, util.SEQ_TAKE, util.SEQ_COMPLETE],
        expected: {statusCode: 200, lastStatus: util.STATUS_COMPLETED}
      }
    ],
    verifyInvalidFlows: [
      {
        sequence: [util.SEQ_PLACE, util.SEQ_TAKE, util.SEQ_COMPLETE, util.SEQ_COMPLETE],
        expected: {schema: validator.ERROR_SCHEMA, error: error.general.orderStatusNotOngoing}
      }
    ],
    verifyNegativeInput: [
      {
        desc: 'POST request',
        endpoint: config.sampleAPI.completeOrder(0),
        verb: util.VERB_POST,
        data: '',
        expected: {error: error.general.methodNotAllowed, schema: validator.EMPTY_SCHEMA}
      },
      {
        desc: 'GET request',
        endpoint: config.sampleAPI.completeOrder(0),
        verb: util.VERB_GET,
        expected: {error: error.general.methodNotAllowed, schema: validator.EMPTY_SCHEMA}
      },
      {
        desc: 'PATCH request',
        endpoint: config.sampleAPI.completeOrder(0),
        verb: util.VERB_PATCH,
        expected: {error: error.general.methodNotAllowed, schema: validator.EMPTY_SCHEMA}
      },
      {
        desc: 'DELETE request',
        endpoint: config.sampleAPI.completeOrder(0),
        verb: util.VERB_DELETE,
        expected: {error: error.general.methodNotAllowed, schema: validator.EMPTY_SCHEMA}
      },
      { // @pippinchan: [Assumption] Server would not use 0 as order ID, so used 0 as NOT_FOUND order
        desc: 'nonexistent order ID',
        endpoint: config.sampleAPI.completeOrder(0),
        verb: util.VERB_PUT,
        expected: {error: error.general.orderNotFound, schema: validator.ERROR_SCHEMA}
      },
      { // @pippinchan: FIXME: undefined endpoint?
        desc: '[FAIL] negative number order ID',
        endpoint: config.sampleAPI.completeOrder(-1),
        verb: util.VERB_GET,
        expected: {error: error.general.orderNotFound, schema: validator.ERROR_SCHEMA}
      },
      { // @pippinchan: FIXME: undefined endpoint?
        desc: '[FAIL] string order ID',
        endpoint: config.sampleAPI.completeOrder('abc'),
        verb: util.VERB_GET,
        expected: {error: error.general.invalidOrderId, schema: validator.ERROR_SCHEMA}
      },
    ]
  };

  describe('Verify valid flows', function () {
    let tc = 1;
    tests.verifyValidFlows.forEach(function (test) {
      it(`${tc++}. sequence [${test.sequence.join(' > ')}] should yield HTTP ${test.expected.statusCode}, ` +
        `${test.expected.lastStatus} status, and valid JSON`,
        async function () {
          // perform the sequence
          let res = await util.sendRequests({mocha: this, sequence: test.sequence});
          let lastResult = res[test.sequence.length - 1];
          expect(lastResult.body.status).to.be.equal(test.expected.lastStatus);

          validator.validateResponse({
            response: lastResult, schema: validator.COMPLETE_ORDER_SCHEMA, status: test.expected.statusCode
          });
        })
    });
  });

  describe('Verify invalid flows', function () {
    let tc = 1;
    tests.verifyInvalidFlows.forEach(function (test) {
      it(`${tc++}. sequence [${test.sequence.join(' > ')}] should yield HTTP ${test.expected.statusCode}, ` +
        `and custom error message`,
        async function () {
          // perform the sequence
          let res = await util.sendRequests({mocha: this, sequence: test.sequence});
          let lastResult = res[test.sequence.length - 1];

          util.validateErrorResponse({
            response: lastResult, schema: test.expected.schema, status: test.expected.error.statusCode,
            errorMessage: test.expected.error.message
          });
        })
    });
  });

  describe('Verify negative input', function () {
    let tc = 1;
    tests.verifyNegativeInput.forEach(function (test) {
      it(`${tc++}. should not accept ${test.desc}`, async function () {
        let res = await util.sendRequest({
          mocha: this,
          title: util.SEQ_COMPLETE,
          server: config.sampleAPI.server,
          endpoint: test.endpoint,
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
