const sut    = require('../src/index');
const expect = require('chai').expect;

describe('Testing evaluate functionality:', () => {
  let drone;

  beforeEach(async () => {
    drone = await sut.createDrone({headless: true});
  });

  afterEach(async () => {
    drone.protocol.close();
    drone.chrome.kill();
  });

  it('Can successfully evaluate code in the drone', async () => {
    const code = String.raw`var updateId = (content) => { document.getElementById('evaluation-target').innerHTML = content };
                            updateId('<p id="evaluated">Code Successfully Evaluated</p>');`;
    await sut.goTo(drone, `file://${process.env.PWD}/test/html/evaluate.html`);
    await sut.evaluate(drone, code);
    const actualState = await drone.protocol.Runtime.evaluate({expression: "document.querySelector('#evaluated').innerHTML"});
    expect('Code Successfully Evaluated').to.equal(actualState.result.value);
  });
});
