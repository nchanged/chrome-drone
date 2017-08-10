const sut    = require('../src/index');
const expect = require('chai').expect;

describe('Testing real clicking functionality:', () => {
  let drone;

  beforeEach(async () => {
    drone = await sut.createDrone({headless: true});
  });

  afterEach(async () => {
    await drone.protocol.close();
    await drone.chrome.kill();
  });

  it('Can successfully simuulate a real click by doing a mouse down and mouse up on an element based on its selector', async () => {
    await sut.goTo(drone, `file://${process.env.PWD}/test/html/real-click.html`);
    await sut.realClick(drone, '#tricky-div');
    const actualState = await drone.protocol.Runtime.evaluate({expression: "document.querySelector('#tricky-div-results').innerText"});
    expect('Div successfully clicked').to.equal(actualState.result.value);
  });
});
