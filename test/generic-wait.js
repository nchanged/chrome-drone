const sut    = require('../src/index');
const expect = require('chai').expect;

describe('Testing waiting for specified time functionality:', () => {
  let drone;

  beforeEach(async () => {
    drone = await sut.createDrone({headless: true});
  });

  afterEach(async () => {
    await drone.protocol.close();
    await drone.chrome.kill();
  });

  it('Can successfully wait for specified amount of time', async () => {
    await sut.goTo(drone, `file://${process.env.PWD}/test/html/generic-wait.html`);
    await sut.wait(drone, 1100);
    const actualState = await drone.protocol.Runtime.evaluate({expression: "document.querySelector('#thanks-for-waiting').innerHTML"});
    expect('Delayed Gratification').to.equal(actualState.result.value);
  });

});
