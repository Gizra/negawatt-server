'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:UsageCtrl
 * @description
 * # UsageCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('UsageCtrl', function UsageCtrl($scope, ApplicationState) {
    var usageCtrl = this;

    // Register this with appState.
    ApplicationState.registerDetailedChart(this);

    this.setup = function(chartDateRange, chartReferenceDate) {
      $scope.dateRange = chartDateRange;
    };

    this.setChartTitle = function(title) {
      $scope.title = title;
    };

  });
