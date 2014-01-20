'use strict';

describe('Service: Miner', function () {

  // load the service's module
  beforeEach(module('nodeminerApp'));

  // instantiate service
  var Miner;
  beforeEach(inject(function (_Miner_) {
    Miner = _Miner_;
  }));

  it('should do something', function () {
    expect(!!Miner).toBe(true);
  });

});
