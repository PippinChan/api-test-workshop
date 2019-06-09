const config = require('../config');
const chai = require('chai');
const moment = require('moment');

chai.use(require('chai-http'));

const expect = chai.expect;

let lastSuccessfulOrderId = null;

let util = {
    /**
     * @return  {object}    new chai request object to the server
     */
    newRequest: () => chai.request(config.server),

    /**
     * @param   {object[]}  options.stops       list of GPS coordinates
     *                                          e.g.
     *                                          [{'lat':22.281939,'lng':114.158245},
     *                                          {'lat':22.319263,'lng':114.169373}]
     * @param   {function}  options.callback    to receive the response object from chai
     */
    placeOrderNow: options => {
        util.newRequest()
            .post(config.apiPlaceOrder)
            .send({
                stops: options.stops
            })
            .end((err, res) => {
                expect(err).to.be.null;
                if (typeof res.body.id === 'number') lastSuccessfulOrderId = res.body.id;
                if (typeof options.callback === 'function') options.callback(res);
            });
    },
    /**
     * @param   {object[]}  options.stops       list of GPS coordinates
     *                                          e.g.
     *                                          [{'lat':22.281939,'lng':114.158245},
     *                                          {'lat':22.319263,'lng':114.169373}]
     * @param   {string}    options.orderAt     ISO string to represent time of order
     *                                          e.g. '2018-09-03T13:00:00.000Z'
     * @param   {function}  options.callback    to receive the response object from chai
     */
    placeOrderLater: options => {
        util.newRequest()
            .post(config.apiPlaceOrder)
            .send({
                stops: options.stops,
                orderAt: options.orderAt
            })
            .end((err, res) => {
                expect(err).to.be.null;
                if (typeof res.body.id === 'number') lastSuccessfulOrderId = res.body.id;
                if (typeof options.callback === 'function') options.callback(res);
            });
    },
    /**
     * @param   {number}    options.orderId     to cancel the order
     * @param   {function}  options.callback    to receive the response object from chai
     */
    cancelOrder: options => {
        util.newRequest()
            .put(config.apiCancelOrder(options.orderId))
            .end((err, res) => {
                expect(err).to.be.null;
                if (typeof options.callback === 'function') options.callback(res);
            });
    },
    /**
     * @param   {function}  options.callback    to receive the response object from chai
     *                                          response is undefined if there is no previously successful order
     */
    cancelLastSuccessfullyPlacedOrder: options => {
        if (typeof lastSuccessfulOrderId === 'number')
            util.cancelOrder({
                orderId: lastSuccessfulOrderId,
                callback: options.callback
            });
        // call the callback in case there is no last order
        else if (typeof options.callback === 'function') options.callback();
    },
    /**
     * @param   {number}    options.hour
     * @param   {number}    options.minute
     * @param   {number}    options.second
     * @returns {string}
     */
    getISOTimeNextDay: options => {
        return moment()
            .utcOffset(config.timezone)
            .add(1, 'day')
            .hour(options.hour)
            .minute(options.minute)
            .second(options.second)
            .toISOString();
    },
    /**
     * @param   {number}    options.amount
     * @param   {string}    options.unit
     * @see     https://momentjs.com/docs/#/manipulating/add/
     * @returns {string}
     */
    getISOTimeOffsetFromPresent: options => {
        return moment()
            .utcOffset(config.timezone)
            .add(options.amount, options.unit)
            .toISOString();
    }
};

module.exports = util;
