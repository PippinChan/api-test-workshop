const config = require('../config')
    , chai = require('chai')
    , moment = require('moment')
;

chai.use(require('chai-http'));

const expect = chai.expect;

let lastSuccessfulOrderId = null;

module.exports = {
    placeOrderNow: (stops, callback) => {
        chai.request(config.server)
            .post(config.apiPlaceOrder)
            .send({
                'stops': stops
            })
            .end((err, res) => {
                expect(err).to.be.null;
                if (typeof res.body.id === 'number') lastSuccessfulOrderId = res.body.id;
                if (typeof callback === 'function') callback(res);
            });
    },
    placeOrderLater: (stops, orderAt, callback) => {
        chai.request(config.server)
            .post(config.apiPlaceOrder)
            .send({
                'stops': stops,
                'orderAt': orderAt
            })
            .end((err, res) => {
                expect(err).to.be.null;
                if (typeof res.body.id === 'number') lastSuccessfulOrderId = res.body.id;
                if (typeof callback === 'function') callback(res);
            });
    },
    cancelOrder: (orderId, callback) => {
        chai.request(config.server)
            .put(config.apiCancelOrder(orderId))
            .end((err, res) => {
                expect(err).to.be.null;
                if (typeof callback === 'function') callback(res);
            });
    },
    cancelLastSuccessfullyPlacedOrder: (callback) => {
        if (typeof lastSuccessfulOrderId === 'number') module.exports.cancelOrder(lastSuccessfulOrderId, callback);
    },
    getISOTimeNextDay: (h, m, s) => {
        let isoString = moment().utcOffset(config.timezone).add(1, 'day').hour(h).minute(m).second(s).toISOString();
        return isoString;
    },
    getISOTimeOffsetFromPresent: (amount, unit) => {
        let isoString = moment().utcOffset(config.timezone).add(amount, unit).toISOString();
        return isoString;
    }
};
