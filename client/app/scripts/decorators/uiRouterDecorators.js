angular.module('negawattClientApp')
  .config(function ($provide) {
    $provide.decorator('$state', function($delegate) {
      // debugger


      return $delegate;
    });
  });
