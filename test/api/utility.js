const config = require('../config')
    , chai = require('chai')
    , moment = require('moment')
;

chai.use(require('chai-http'));

const expect = chai.expect;

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
    },
    getISOTimeNextDay: function (h, m, s) {
        let isoString = moment().utcOffset(config.timezone).add(1, 'day').hour(h).minute(m).second(s).toISOString();
        console.log('[utility] getISOTimeNextDay ==>', isoString);
        return isoString;
    },
    getISOTimeYesterday: function (h, m, s) {
        let isoString = moment().utcOffset(config.timezone).subtract(1, 'day').hour(h).minute(m).second(s).toISOString();
        console.log('[utility] getISOTimeYesterday ==>', isoString);
        return isoString;
    }
};
