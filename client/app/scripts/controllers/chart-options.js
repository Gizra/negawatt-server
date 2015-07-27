'use strict';

angular.module('negawattClientApp')
  .controller('ChartOptionsCtrl', function($scope, Chart) {
    var vm = this;

    /**
     * Set Chart options comapre with.
     */
    vm.select = function() {
      Chart.set = ('compareWith', this.compareWith);
    }
  });
