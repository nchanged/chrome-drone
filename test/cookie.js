const sut    = require('../src/index');
const expect = require('chai').expect;

describe('Testing cookie setting and getting functionality:', () => {
  let drone;

  beforeEach(async () => {
    drone = await sut.createDrone({headless: true});
  });

  afterEach(async () => {
    await drone.protocol.close();
    await drone.chrome.kill();
  });

  it('Can successfully create and get cookies', async () => {
    await sut.goTo(drone, `http://google.com`);
    await sut.setCookie(drone, {name: "zeeTestCookie", value: "Got this going for me"});
    const theCookie = await sut.getCookies(drone);
    expect('zeeTestCookie').to.equal(theCookie.cookies[0].name);
    expect('Got this going for me').to.equal(theCookie.cookies[0].value);
  });
});
