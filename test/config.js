let config = {
    server: 'http://localhost:51544/',

    apiPing: 'ping',
    apiPlaceOrder: 'v1/orders',
    apiFetchOrder: 'v1/orders/{orderID}',
    apiTakeOrder: 'v1/orders/{orderID}/take',
    apiCompleteOrder: 'v1/orders/{orderID}/complete',
    apiCancelOrder: 'v1/orders/{orderID}/cancel'
};

module.exports = config;
