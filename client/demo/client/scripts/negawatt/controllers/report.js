'use strict';

angular.module('app')
  .controller('AccountReportCtrl', function($scope, ChartLine, ChartPie, Electricity) {

    /**
     * Get the chart data and plot.
     *
     * @param meterSelected
     *   id of the meter selected.
     */
    function plotChart(meterSelected) {
      var filters = {
          type: 'month'
        };

      if (meterSelected) {
        filters.meter = meterSelected;
      }

      // Get chart data object.
      Electricity.get(filters)
        .then(ChartLine.getLineChart)
        .then(function(response) {
          $scope.line = {
            data: response.data,
            options: response.options
          };

        });
    }

    $scope.$on('negawatt.markerSelected', function(event, meterSelected) {
      $scope.meterSelected = meterSelected;

      // Select last year report like default.
      plotChart($scope.meterSelected.id);
    });

  });
