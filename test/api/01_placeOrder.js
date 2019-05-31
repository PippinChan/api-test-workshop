const config = require('../config')
    , constant = require('../constants')
    , chai = require('chai')
    , chaiHttp = require('chai-http');

chai.use(chaiHttp);

const expect = chai.expect;

describe('01. API place order', function() {
    describe('POST /orders', function() {
        it('This is a temporary test', function(done) {
            // TODO: make this look cleaner

            chai.request(config.server).post(config.apiPlaceOrder)
                .send({
                    stops: [constant.place.mongKokStn, constant.place.tstStn]
                })
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);

                    // TODO: validate response
                    expect(res.body).to.include.keys('id');
                    expect(res.body).to.include.keys('drivingDistancesInMeters');
                    expect(res.body).to.include.keys('fare');
                    console.log('PLACE', res.body);

                    expect(res.body['id']).to.be.a('number');
                    expect(res.body['drivingDistancesInMeters']).to.be.an('array');
                    expect(res.body['fare']).to.be.an('object');
                    let thisID = res.body.id;

                    // TEMP: cancel it
                    // TODO: is there a delete-all-order shortcut API ?
                    chai.request(config.server).put(config.apiCancelOrder(thisID))
                        .end(function (err, res) {
                            expect(err).to.be.null;
                            expect(res).to.have.status(200);
                            console.log('CANCEL', res.body);
                            done();
                        });
                });
        });
    });
});
