const chai = require('chai');
const ajv = new (require('ajv'));
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));

const expect = chai.expect;

module.exports = {

    /** compiled ajv validator functions **/
    PLACE_ORDER_SCHEMA: ajv.compile(require('./01_placeOrder.schema')),
    EMPTY_SCHEMA: ajv.compile(require('./98_empty.schema')),
    ERROR_SCHEMA: ajv.compile(require('./99_error.schema')),

    /**
     * @param    {Object}   options.response    response object from chai
     * @param    {number}   options.status      expected HTTP status code
     * @param    {function} options.schema      one of the compiled ajv validator functions (see above section)
     */
    validateResponse: options => {
        expect(options.response).to.have.status(options.status);
        let isValidJSON = options.schema(options.response.body);
        let errorMessage = (isValidJSON) ? '' : JSON.stringify(options.schema.errors);

        // if JSON is not valid, error definition from validator is printed
        expect(isValidJSON, errorMessage).to.be.true;
    }
};
