const sut    = require('../src/index');
const expect = require('chai').expect;

describe('Testing clicking functionality:', () => {
  let drone;

  beforeEach(async () => {
    drone = await sut.createDrone({headless: true});
  });

  afterEach(async () => {
    await drone.protocol.close();
    await drone.chrome.kill();
  });

  it('Can successfully click a button', async () => {
    await sut.goTo(drone, `file://${process.env.PWD}/test/html/click.html`);
    await sut.click(drone, '#target-button');
    const actualState = await drone.protocol.Runtime.evaluate({expression: "document.querySelector('#success').innerHTML"});
    expect('Button successfully clicked').to.equal(actualState.result.value);
  });
});
