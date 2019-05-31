const config = require('../config')
    , chai = require('chai')
    , chaiHttp = require('chai-http');

chai.use(chaiHttp);

const expect = chai.expect;

describe('05. API cancel order', function() {
    describe('PUT /orders/{orderID}/cancel', function() {
        it('Returns HTTP 404 if the order does not exist', function(done) {
            chai.request(config.server)
                .put(config.apiCancelOrder(-2148))
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(404);
                    expect(res.body).to.be.an('object').that.is.empty;
                    done();
                });
        });
    });
});
