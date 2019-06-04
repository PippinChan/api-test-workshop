// TODO: This could be refactored to interchangeable environment files

module.exports = {
    server: 'http://localhost:51544/',

    // This timezone should match server's clock
    timezone: '+00:00',

    apiPing: 'ping',
    apiPlaceOrder: 'v1/orders',
    apiFetchOrder: function (orderID) { return `v1/orders/${orderID}`; },
    apiTakeOrder: function (orderID) { return `v1/orders/${orderID}/take`; },
    apiCompleteOrder: function (orderID) { return `v1/orders/${orderID}/complete`; },
    apiCancelOrder: function (orderID) { return `v1/orders/${orderID}/cancel`; },
};
