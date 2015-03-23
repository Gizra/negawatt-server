'use strict';

describe('Service: timedate', function () {

  // load the service's module
  beforeEach(module('negawattClientApp'));

  // instantiate service
  var timedate;
  beforeEach(inject(function (_timedate_) {
    timedate = _timedate_;
  }));

  it('should do something', function () {
    expect(!!timedate).toBe(true);
  });

});
