const config = require('../config')
    , chai = require('chai');

chai.use(require('chai-http'));

const expect = chai.expect;

// To help reduce repeating code, this module is intended to keep requests to APIs and their default checks in handy.

module.exports = {
    placeOrderNow: function(stops, callback) {
        console.log('[utility] placeOrderNow stops=', JSON.stringify(stops));

        chai.request(config.server)
            .post(config.apiPlaceOrder)
            .send({
                'stops': stops
            })
            .end(function (err, res) {
                expect(err).to.be.null;

                console.log('[utility] placeOrderNow httpStatus=', res.status);
                console.log('[utility] placeOrderNow get id=', res.body['id']);
                if (typeof callback === 'function') callback(res);
            });
    },
    placeOrderLater: function(stops, orderAt, callback) {
        console.log('[utility] placeOrderLater stops=', JSON.stringify(stops));
        console.log('[utility] placeOrderLater orderAt=', orderAt);

        chai.request(config.server)
            .post(config.apiPlaceOrder)
            .send({
                'stops': stops,
                'orderAt': orderAt
            })
            .end(function (err, res) {
                expect(err).to.be.null;

                console.log('[utility] placeOrderLater httpStatus=', res.status);
                console.log('[utility] placeOrderLater get id=', res.body['id']);
                if (typeof callback === 'function') callback(res);
            });
    },
    cancelOrder: function (orderId, callback) {
        console.log('[utility] cancelOrder orderId=', orderId);

        chai.request(config.server)
            .put(config.apiCancelOrder(orderId))
            .end(function (err, res) {
                expect(err).to.be.null;

                console.log('[utility] cancelOrder httpStatus=', res.status);
                if (typeof callback === 'function') callback(res);
            });
    }
};
