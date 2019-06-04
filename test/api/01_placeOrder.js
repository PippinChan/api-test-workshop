const constant = require('../constants')
    , chai = require('chai')
    , utility = require('./utility')
    , Ajv = require('ajv');

chai.use(require('chai-http'));

const ajv = new Ajv();
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));

const expect = chai.expect;
const validatePlaceOrder = ajv.compile(require('../schema/01_placeOrder.schema.json'));

const expected = {
    currency: 'HKD',
    priceCompareThreshold: 0.01,
    rates: {
        normal: {
            minimum: 20,
            additional: { metre: 200, rate: 5 },
            time: {
                from: { hour: 5, minute: 0, second: 0 },
                to: { hour: 21, minute: 59, second: 59 }
            }
        },
        lateNight: {
            minimum: 30,
            additional: { metre: 200, rate: 8 },
            time: {
                from: { hour: 22, minute: 0, second: 0 },
                to: { hour: 4, minute: 59, second: 59 }
            }
        },
    }
};

describe('01. Place Order (POST /orders)', function() {
    describe('Verify data schema', function() {
        let createdOrderID;

        before(function(done) {
           createdOrderID = 0;
           done();
        });

        it('order now - should return id, distance, fare', function(done) {
            utility.placeOrderNow(
                [constant.place.centralStn, constant.place.tstStn],
                function (res) {
                    expect(res).to.have.status(201);

                    let valid = validatePlaceOrder(res.body);
                    let validationError = JSON.stringify(validatePlaceOrder.errors);
                    expect(valid, validationError).to.be.true;

                    createdOrderID = res.body['id'];
                    done();
                });
        });

        after(function(done) {
            utility.cancelOrder(createdOrderID, function() {
                done();
            });
        })
    });
});
