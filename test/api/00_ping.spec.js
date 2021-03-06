const config = require('../config');
const chai = require('chai');
chai.use(require('chai-http'));

const util = require('./util');

const expect = chai.expect;

describe('00. Ping (GET /ping)', function () {
  describe('Verify pong', function () {
    let tc = 1;
    it(`${tc}. should return pong message`, async function () {
      let res = await util.sendRequest({
        mocha: this,
        title: 'Ping',
        server: config.sampleAPI.server,
        endpoint: config.sampleAPI.ping,
        verb: util.VERB_GET
      });
      expect(res).to.have.status(200);
      expect(res.body.msg).to.be.equal('pong');
    });
  });
});
