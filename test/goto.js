const sut    = require('../src/index');
const expect = require('chai').expect;

describe('Testing goto functionality:', () => {
  let drone;

  beforeEach(async () => {
    drone = await sut.createDrone({headless: true});
  });

  afterEach(async () => {
    drone.protocol.close();
    drone.chrome.kill();
  });

  it('Can successfully navigate to specified url', async () => {
    await sut.goTo(drone, `file://${process.env.PWD}/test/html/empty.html`);
    const result = await drone.protocol.Runtime.evaluate({expression: 'document.querySelector("title").textContent'});
    expect('An Empty Canvas').to.equal(result.result.value);
  });
});
