const config = require('../config')
    , chai = require('chai')
    , chaiHttp = require('chai-http');

chai.use(chaiHttp);

const expect = chai.expect;

describe('02. API fetch order', function() {
    describe('GET /orders/{orderID}', function() {
        it('Returns HTTP 404 if the order does not exist', function(done) {
            chai.request(config.sampleAPI.server)
            // @pippinchan: [Assumption] Server would not 0 as order ID, so used 0 as NOT_FOUND order
                .get(config.sampleAPI.fetchOrder(0))
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(404);
                    expect(res.body).to.be.an('object');

                    // expect ORDER_NOT_FOUND to be a custom message for now
                    expect(res.body).to.have.all.keys('message');
                    expect(res.body.message).to.be.a('string');
                    done();
                });
        });
    });
});
