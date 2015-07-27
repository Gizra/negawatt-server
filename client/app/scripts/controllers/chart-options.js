'use strict';

angular.module('negawattClientApp')
  .controller('ChartOptionsCtrl', function() {
    var vm = this;

    vm.select = function(item) {
      console.log(item, 'test');
    }
  });
