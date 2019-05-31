const config = require('../config')
    , chai = require('chai')
    , chaiHttp = require('chai-http');

chai.use(chaiHttp);

const expect = chai.expect;

describe('02. API fetch order', function() {
    describe('GET /orders/{orderID}', function() {
        it('Returns HTTP 404 if the order does not exist', function(done) {
            chai.request(config.server)
                .get(config.apiFetchOrder(-2148))
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(404);
                    expect(res.body).to.be.an('object').that.is.empty;
                    done();
                });
        });
    });
});
