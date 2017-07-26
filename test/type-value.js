const sut    = require('../src/index');
const expect = require('chai').expect;

describe('Testing typeValue functionality:', () => {
  let drone;

  beforeEach(async () => {
    drone = await sut.createDrone({headless: true});
  });

  afterEach(async () => {
    await drone.protocol.close();
    await drone.chrome.kill();
  });

  it('Drone can successfully type value in inputs', async () => {
    await sut.goTo(drone, `file://${process.env.PWD}/test/html/type-value.html`);
    await sut.typeValue(drone, '#typing-test-input', 'Typed By Robot');
    const actualState = await drone.protocol.Runtime.evaluate({expression: "document.querySelector('#output').innerHTML"});
    expect('Typed By Robot').to.equal(actualState.result.value);
  });
});
