// @pippinchan: TODO: This could be refactored to interchangeable environment files
// @pippinchan: TODO: In micro-services architecture there might be multiple servers, endpoints to connect with

module.exports = {
    // This timezone should match server's clock
    timezone: '+00:00',

    sampleAPI: {
        server: 'http://localhost:51544/',
        ping: 'ping',
        placeOrder: 'v1/orders',
        fetchOrder: orderID => `v1/orders/${orderID}`,
        takeOrder: orderID => `v1/orders/${orderID}/take`,
        completeOrder: orderID => `v1/orders/${orderID}/complete`,
        cancelOrder: orderID => `v1/orders/${orderID}/cancel`,
    }
};
