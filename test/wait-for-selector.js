const sut    = require('../src/index');
const expect = require('chai').expect;

describe('Testing waiting for selector functionality:', () => {
  let drone;

  beforeEach(async () => {
    drone = await sut.createDrone({headless: true});
  });

  afterEach(async () => {
    await drone.protocol.close();
    await drone.chrome.kill();
  });

  it('Can successfully wait for selector to exist', async () => {
    await sut.goTo(drone, `file://${process.env.PWD}/test/html/wait-for-selector.html`);
    await sut.click(drone, '#some-button');
    await sut.waitForSelector(drone, '#result');
    const actualState = await drone.protocol.Runtime.evaluate({expression: "document.querySelector('#result').innerHTML"});
    expect('Here I Am').to.equal(actualState.result.value);
  });

  it('Can successfully wait for selector to exist alternate selectors v1', async () => {
    await sut.goTo(drone, `file://${process.env.PWD}/test/html/wait-for-selector.html`);
    await sut.click(drone, 'input[type="button"]');
    await sut.waitForSelector(drone, 'p[name="lateGuy"]');
    const actualState = await drone.protocol.Runtime.evaluate({expression: "document.querySelector('#result').innerHTML"});
    expect('Here I Am').to.equal(actualState.result.value);
  });

  it('Can successfully wait for selector to exist alternate selectors v2', async () => {
    await sut.goTo(drone, `file://${process.env.PWD}/test/html/wait-for-selector.html`);
    await sut.click(drone, "input[type='button']");
    await sut.waitForSelector(drone, "p[name='lateGuy']");
    const actualState = await drone.protocol.Runtime.evaluate({expression: "document.querySelector('#result').innerHTML"});
    expect('Here I Am').to.equal(actualState.result.value);
  });

});
