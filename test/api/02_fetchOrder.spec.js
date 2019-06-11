const config = require('../config');
const chai = require('chai');
chai.use(require('chai-http'));

const util = require('./util');

const validator = require('../schema/JSONValidator');
const error = require('../data/errorMessages');

const expect = chai.expect;

describe('02. Fetch Order (GET /orders/{orderID})', function () {
  let tests = {
    verifyNegativeInput: [
      {
        desc: 'POST request',
        endpoint: config.sampleAPI.fetchOrder(0),
        verb: util.VERB_POST,
        data: '',
        expected: {error: error.general.methodNotAllowed, schema: validator.EMPTY_SCHEMA}
      },
      {
        desc: 'PUT request',
        endpoint: config.sampleAPI.fetchOrder(0),
        verb: util.VERB_PUT,
        expected: {error: error.general.methodNotAllowed, schema: validator.EMPTY_SCHEMA}
      },
      {
        desc: 'PATCH request',
        endpoint: config.sampleAPI.fetchOrder(0),
        verb: util.VERB_PATCH,
        expected: {error: error.general.methodNotAllowed, schema: validator.EMPTY_SCHEMA}
      },
      {
        desc: 'DELETE request',
        endpoint: config.sampleAPI.fetchOrder(0),
        verb: util.VERB_DELETE,
        expected: {error: error.general.methodNotAllowed, schema: validator.EMPTY_SCHEMA}
      },
      { // @pippinchan: [Assumption] Server would not use 0 as order ID, so used 0 as NOT_FOUND order
        desc: 'nonexistent order ID',
        endpoint: config.sampleAPI.fetchOrder(0),
        verb: util.VERB_GET,
        expected: {error: error.general.orderNotFound, schema: validator.ERROR_SCHEMA}
      },
      { // @pippinchan: FIXME: undefined endpoint?
        desc: '[FAIL] negative number order ID',
        endpoint: config.sampleAPI.fetchOrder(-1),
        verb: util.VERB_GET,
        expected: {error: error.general.orderNotFound, schema: validator.ERROR_SCHEMA}
      },
      { // @pippinchan: FIXME: undefined endpoint?
        desc: '[FAIL] string order ID',
        endpoint: config.sampleAPI.fetchOrder('abc'),
        verb: util.VERB_GET,
        expected: {error: error.general.invalidOrderId, schema: validator.ERROR_SCHEMA}
      },
    ]
  };

  describe('Verify negative input', function () {
    let tc = 1;
    tests.verifyNegativeInput.forEach(function (test) {
      it(`${tc++}. should not accept ${test.desc}`, function (done) {
        util.sendRequest({
          mocha: this,
          title: 'Fetch order',
          server: config.sampleAPI.server,
          endpoint: test.endpoint,
          verb: test.verb,
          data: test.data,
          callback: function (result) {
            util.validateErrorResponse({
              response: result.res, schema: test.expected.schema, status: test.expected.error.statusCode,
              errorMessage: test.expected.error.message
            });
            done();
          }
        });
      });
    });
  });
});
