'use strict';

angular.module('negawattClientApp')
  .controller('BigChartCtrl', function($scope, $filter, Chart, Electricity, electricityMock) {
    var bigChartCtrl = this;

    var options = {};
    var electricity = electricityMock.electricity;

    bigChartCtrl.dataset = $filter('toChartDataset')(electricity, compareWith, options, 'ColumnChart');
  });
