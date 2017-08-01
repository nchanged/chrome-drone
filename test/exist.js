const sut    = require('../src/index');
const expect = require('chai').expect;

describe('Testing checking for selector to exist:', () => {
  let drone;

  beforeEach(async () => {
    drone = await sut.createDrone({headless: true});
  });

  afterEach(async () => {
    await drone.protocol.close();
    await drone.chrome.kill();
  });

  it('Expected boolean is returned based on selectors existence', async () => {
    await sut.goTo(drone, `file://${process.env.PWD}/test/html/exists.html`);
    const existingSelector = await sut.exist(drone, '#iExist');
    const fictionalSelector = await sut.exist(drone, '#iDoNotExist');
    expect(true).to.equal(existingSelector);
    expect(false).to.equal(fictionalSelector);
  });
});
