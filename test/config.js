let config = {
    server: 'http://localhost:51544/',

    apiPing: 'ping',
    apiPlaceOrder: 'v1/orders',
    apiFetchOrder: function (orderID) { return `v1/orders/${orderID}`; },
    apiTakeOrder: function (orderID) { return `v1/orders/${orderID}/take`; },
    apiCompleteOrder: function (orderID) { return `v1/orders/${orderID}/complete`; },
    apiCancelOrder: function (orderID) { return `v1/orders/${orderID}/cancel`; },
};

module.exports = config;
