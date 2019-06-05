const chai = require('chai');
const ajv = new (require('ajv'));
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));

const expect = chai.expect;

module.exports = {
    validatePlaceOrder: ajv.compile(require('./01_placeOrder.schema')),
    validateError: ajv.compile(require('./99_error.schema')),

    /**
     * @param   {object}    options.res                 chai response object
     * @param   {number}    options.expectedStatus      HTTP status number
     * @param   {function}  options.schemaValidator     ajv schema validator function (one of the above)
     */
    validateAPIResponse: options => {
        expect(options.res).to.have.status(options.expectedStatus);
        let isValidJSON = options.schemaValidator(options.res.body);
        let errors = (isValidJSON) ? null : JSON.stringify(options.schemaValidator.errors);

        // if JSON is not valid, error definition from validator is printed
        expect(isValidJSON, errors).to.be.true;
    }
};
