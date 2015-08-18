'use strict';

angular.module('negawattClientApp')
  .controller('BigChartCtrl', function($scope, $filter, Chart, Electricity, electricityMock) {
    var vm = this;

    var options = {};
    var electricity = electricityMock.electricity;

    vm.dataset = $filter('toChartDataset')(electricity, compareWith, options, 'ColumnChart');
  });
