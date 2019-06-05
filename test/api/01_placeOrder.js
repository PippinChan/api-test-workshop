require('../config');
new (require('moment'));
const constant = require('../constants')
    , chai = require('chai')
    , ajv = new (require('ajv'))
    , utility = require('./utility')
;

chai.use(require('chai-http'));
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
const validatePlaceOrder = ajv.compile(require('../schema/01_placeOrder.schema.json'));
const expectValidPlaceOrder = function (resBody) {
    let isValid = validatePlaceOrder(resBody);
    let errors = (isValid) ? null : JSON.stringify(validatePlaceOrder.errors);
    expect(isValid, errors).to.be.true;
};

const expect = chai.expect;
const expected = {
    currency: 'HKD',
    priceCompareThreshold: 0.01,
    rates: {
        normal: {
            minimum: 20,
            additional: {metre: 200, rate: 5},
            time: {
                from: {hour: 5, minute: 0, second: 0},
                to: {hour: 21, minute: 59, second: 59}
            }
        },
        lateNight: {
            minimum: 30,
            additional: {metre: 200, rate: 8},
            time: {
                from: {hour: 22, minute: 0, second: 0},
                to: {hour: 4, minute: 59, second: 59}
            }
        },
    }
};

describe('01. Place Order (POST /orders)', function () {
    describe('Verify data schema', function () {
        let createdOrderID;

        beforeEach(function (done) {
            createdOrderID = 0;
            done();
        });

        afterEach(function (done) {
            utility.cancelOrder(createdOrderID, function () {
                done();
            });
        });

        it('should return valid JSON for "order now"', function (done) {
            utility.placeOrderNow(
                [constant.place.centralStn, constant.place.tstStn],
                function (res) {
                    expect(res).to.have.status(201);
                    expectValidPlaceOrder(res.body);
                    createdOrderID = res.body['id'];
                    done();
                });
        });

        it('should return valid JSON for "order later"', function (done) {
            utility.placeOrderLater(
                [constant.place.centralStn, constant.place.tstStn],
                utility.getISOTimeNextDay(0, 0, 0),
                function (res) {
                    expect(res).to.have.status(201);
                    expectValidPlaceOrder(res.body);
                    createdOrderID = res.body['id'];
                    done();
                });
        });
    });
});
