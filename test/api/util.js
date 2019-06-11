const config = require('../config');
const chai = require('chai');
const moment = require('moment');
const places = require('../data/places');

const addContext = require('mochawesome/addContext');

chai.use(require('chai-http'));

const expect = chai.expect;

let util = {

    lastSuccessfulOrderId: null,

    stops: {
        zero: [],
        one: [places.kwunTongStn],
        two: [places.centralStn, places.tstStn],
        twoNear: [places.mongKokStn, places.tstStn],
        three: [places.kwaiChung8ContainerPort, places.taiWaiTransportCityBldg, places.shaTinGovOffices],
        fromMacau: [places.studioCityMacau, places.tuenMunStn],
        intoTheSea: [places.mongKokStn, places.southChinaSea],
        fromTheSea: [places.southChinaSea, places.mongKokStn]
    },

    VERB_GET: 'get',
    VERB_POST: 'post',
    VERB_PUT: 'put',
    VERB_PATCH: 'patch',
    VERB_DELETE: 'delete',

    /**
     * Send an API request to the server
     * while keeping the context of this request for reporting / investigation purposes
     *
     * @param   {Object}    options.mocha       Mocha's test object, referred to by `this` inside the test function
     * @param   {String}    options.title       title to be printed in the context
     * @param   {String}    options.server      server's URL
     * @param   {String}    options.verb        HTTP verb (get|post|put|patch|delete)
     * @param   {String}    options.endpoint    server's endpoint
     * @param   {Object}    [options.data]      payload to send with the request
     * @param   {Function}  [options.callback]  callback to receive result of this request
     */
    sendRequest: options => {
        let req = chai.request(options.server)
            [options.verb](options.endpoint);

        // record the request context
        let reqContext = {
            server: options.server,
            verb: options.verb,
            endpoint: options.endpoint
        };
        if (typeof options.data === 'object') {
            req.send(options.data);
            reqContext.data = JSON.stringify(options.data);
        }

        // record the response context, then trigger the callback
        req.end(function (err, res) {
            expect(err).to.be.null;
            let resContext = {
                status: res.status,
                body: JSON.stringify(res.body)
            };
            addContext(options.mocha, {title: `${options.title} - Request`, value: reqContext});
            addContext(options.mocha, {title: `${options.title} - Response`, value: resContext});

            // triggering part
            if (typeof options.callback === 'function') options.callback({
                reqContext: reqContext,
                resContext: resContext,
                res: res
            });
        });
    },

    /**
     * @param   {Number}    options.h   time of day (hour)
     * @param   {Number}    options.m   time of day (minute)
     * @param   {Number}    options.s   time of day (second)
     *
     * @returns {String}    ISO string to represent the next day's time in specified hh:mm:ss
     */
    getISOTimeNextDay: options => {
        return moment()
            .utcOffset(config.timezone)
            .add(1, 'day')
            .hour(options.h)
            .minute(options.m)
            .second(options.s)
            .toISOString();
    },
    /**
     * @param   {Number}    options.amount      use negative number to get past time
     * @param   {String}    options.unit        e.g. 'seconds', 'minutes'
     * @see     https://momentjs.com/docs/#/manipulating/add/
     *
     * @returns {String}    ISO string to represent future/past time in specified amount and unit
     */
    getISOTimeFromPresent: options => {
        return moment()
            .utcOffset(config.timezone)
            .add(options.amount, options.unit)
            .toISOString();
    }
};

module.exports = util;
