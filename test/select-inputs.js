const sut    = require('../src/index');
const expect = require('chai').expect;

describe('Testing setting select box value functionality:', () => {
  let drone;

  beforeEach(async () => {
    drone = await sut.createDrone({headless: true});
  });

  afterEach(async () => {
    await drone.protocol.close();
    await drone.chrome.kill();
  });

  it('Can successfully set value of select box by value', async () => {
    await sut.goTo(drone, `file://${process.env.PWD}/test/html/select-input.html`);
    await sut.updateSelectBoxByValue(drone, '#editor-select', 'editor-2');
    const actualState = await drone.protocol.Runtime.evaluate({expression: "document.querySelector('#selected-editor').innerText"});
    expect('Selected Editor: editor-2').to.equal(actualState.result.value);
  });

  it('Can successfully set value of select box by value complex selector', async () => {
    await sut.goTo(drone, `file://${process.env.PWD}/test/html/select-input.html`);
    await sut.updateSelectBoxByValue(drone, "select[name='carl']", 'editor-2');
    const actualState = await drone.protocol.Runtime.evaluate({expression: "document.querySelector('#selected-editor').innerText"});
    expect('Selected Editor: editor-2').to.equal(actualState.result.value);
  });

  it('Can successfully set value of select box by index', async () => {
    await sut.goTo(drone, `file://${process.env.PWD}/test/html/select-input.html`);
    await sut.updateSelectBoxByIndex(drone, '#editor-select', 2);
    const actualState = await drone.protocol.Runtime.evaluate({expression: "document.querySelector('#selected-editor').innerText"});
    expect('Selected Editor: editor-3').to.equal(actualState.result.value);
  });
});
