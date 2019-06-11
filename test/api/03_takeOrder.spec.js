const config = require('../config')
    , chai = require('chai')
    , chaiHttp = require('chai-http');

chai.use(chaiHttp);

const expect = chai.expect;

describe('03. API take order', function() {
    describe('PUT /orders/{orderID}/take', function() {
        it('Returns HTTP 404 if the order does not exist', function(done) {
            chai.request(config.sampleAPI.server)
            // Pass MAX_SAFE_INTEGER in hope to guarantee ORDER_NOT_FOUND. Maybe there is a better way...
                .put(config.sampleAPI.takeOrder(Number.MAX_SAFE_INTEGER))
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
