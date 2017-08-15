const sut    = require('../src/index');
const expect = require('chai').expect;

describe('Testing evaluate function functionality:', () => {
  let drone;

  beforeEach(async () => {
    drone = await sut.createDrone({headless: true});
  });

  afterEach(async () => {
    await drone.protocol.close();
    await drone.chrome.kill();
  });

  it('Can successfully evaluate function in the drone', async () => {
    const code = () => { return document.querySelector('#target').innerText; };
    await sut.goTo(drone, `file://${process.env.PWD}/test/html/evaluate-fn.html`);
    const actualResult = await sut.evaluateFn(drone, code);
    expect('You found me').to.equal(actualResult);
  });

  it('Can successfully evaluate function in the drone using provided context', async () => {
    const context = {selector: '#target'};
    const code = (context) => { return document.querySelector(`${context.selector}`).innerText; };
    await sut.goTo(drone, `file://${process.env.PWD}/test/html/evaluate-fn.html`);
    const actualResult = await sut.evaluateFn(drone, code, context);
    console.log(actualResult);
    expect('You found me').to.equal(actualResult);
  });

});
