'use strict';

angular.module('negawattClientApp')
  .controller('BigChartCtrl', function($scope, $filter, Chart, Electricity, electricityMock) {
    var vm = this;

    var electricity = electricityMock;
    // Mock active frequency.
    Chart.setActiveFrequency(2);

    vm.dataset = $filter('toChartDataset')(electricity)
  });
