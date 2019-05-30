const config = require('./config')
    , chai = require('chai')
    , chaiHttp = require('chai-http');

chai.use(chaiHttp);

const expect = chai.expect;

describe('API ping', function() {
    describe('/ping', function() {
        it('should return pong', function(done) {
            chai.request(config.server)
                .get(config.apiPing)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body.msg).to.be.equal('pong');
                    done();
                });
        });
    });
});
