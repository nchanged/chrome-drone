const sut    = require('../src/index');
const expect = require('chai').expect;

describe('Testing setValue functionality:', () => {
  let drone;

  beforeEach(async () => {
    drone = await sut.createDrone({headless: true});
  });

  afterEach(async () => {
    drone.protocol.close();
    drone.chrome.kill();
  });

  it('Can successfully setValue inputs in drone instance', async () => {
    await sut.goTo(drone, `file://${process.env.PWD}/test/html/set-value.html`);
    await sut.setValue(drone, '#test-input', 'Set By Robot');
    const actualState = await drone.protocol.Runtime.evaluate({expression: "document.querySelector('#test-input').value"});
    expect('Set By Robot').to.equal(actualState.result.value);
  });
});
