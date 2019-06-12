const config = require('../config');
const chai = require('chai');
chai.use(require('chai-http'));

const util = require('./util');

const validator = require('../schema/JSONValidator');
const error = require('../data/errorMessages');

const expect = chai.expect;

describe('05. Cancel Order (PUT /orders/{orderID}/cancel)', function () {
  let tests = {
    verifyValidFlows: [
      {
        sequence: [util.SEQ_PLACE, util.SEQ_TAKE, util.SEQ_CANCEL],
        expected: {statusCode: 200, lastStatus: util.STATUS_CANCELLED}
      },
      {
        sequence: [util.SEQ_PLACE, util.SEQ_CANCEL],
        expected: {statusCode: 200, lastStatus: util.STATUS_CANCELLED}
      }
    ],
    verifyNegativeInput: [
      {
        desc: 'POST request',
        endpoint: config.sampleAPI.cancelOrder(0),
        verb: util.VERB_POST,
        data: '',
        expected: {error: error.general.methodNotAllowed, schema: validator.EMPTY_SCHEMA}
      },
      {
        desc: 'GET request',
        endpoint: config.sampleAPI.cancelOrder(0),
        verb: util.VERB_GET,
        expected: {error: error.general.methodNotAllowed, schema: validator.EMPTY_SCHEMA}
      },
      {
        desc: 'PATCH request',
        endpoint: config.sampleAPI.cancelOrder(0),
        verb: util.VERB_PATCH,
        expected: {error: error.general.methodNotAllowed, schema: validator.EMPTY_SCHEMA}
      },
      {
        desc: 'DELETE request',
        endpoint: config.sampleAPI.cancelOrder(0),
        verb: util.VERB_DELETE,
        expected: {error: error.general.methodNotAllowed, schema: validator.EMPTY_SCHEMA}
      },
      { // @pippinchan: [Assumption] Server would not use 0 as order ID, so used 0 as NOT_FOUND order
        desc: 'nonexistent order ID',
        endpoint: config.sampleAPI.cancelOrder(0),
        verb: util.VERB_PUT,
        expected: {error: error.general.orderNotFound, schema: validator.ERROR_SCHEMA}
      },
      { // @pippinchan: FIXME: undefined endpoint?
        desc: '[FAIL] negative number order ID',
        endpoint: config.sampleAPI.cancelOrder(-1),
        verb: util.VERB_GET,
        expected: {error: error.general.orderNotFound, schema: validator.ERROR_SCHEMA}
      },
      { // @pippinchan: FIXME: undefined endpoint?
        desc: '[FAIL] string order ID',
        endpoint: config.sampleAPI.cancelOrder('abc'),
        verb: util.VERB_GET,
        expected: {error: error.general.invalidOrderId, schema: validator.ERROR_SCHEMA}
      },
    ]
  };

  describe.only('Verify valid flows', function () {
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
            response: lastResult, schema: validator.CANCEL_ORDER_SCHEMA, status: test.expected.statusCode
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
          title: util.SEQ_CANCEL,
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
