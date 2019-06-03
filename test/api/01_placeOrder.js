const config = require('../config')
    , constant = require('../constants')
    , chai = require('chai')
    , chaiHttp = require('chai-http');

chai.use(chaiHttp);

const expect = chai.expect;

describe('01. API place order', function() {
    describe('POST /orders', function() {
        it('Now order can be created', function(done) {
            chai.request(config.server).post(config.apiPlaceOrder)
                .send({
                    stops: [constant.place.mongKokStn, constant.place.tstStn]
                })
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);

                    expect(res.body).to.have.all.keys('id', 'drivingDistancesInMeters', 'fare');
                    expect(res.body['id']).to.be.a('number');
                    expect(res.body['drivingDistancesInMeters']).to.be.an('array');
                    expect(res.body['fare']).to.be.an('object');

                    done();
                });
        });

        // TODO: validate fare in day/night time
        //

        after(function() {
            // TODO: we have a choice here to clean-up the created order in tests or not
            // (by cancelling it or other means to delete it ?)
            //
        })
    });
});
