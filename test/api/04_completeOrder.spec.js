const config = require('../config')
    , chai = require('chai')
    , chaiHttp = require('chai-http');

chai.use(chaiHttp);

const expect = chai.expect;

describe('04. API complete order', function() {
    describe('PUT /orders/{orderID}/complete', function() {
        it('Returns HTTP 404 if the order does not exist', function(done) {
            chai.request(config.server)
            // Pass MAX_SAFE_INTEGER in hope to guarantee ORDER_NOT_FOUND. Maybe there is a better way...
                .put(config.apiCompleteOrder(Number.MAX_SAFE_INTEGER))
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
