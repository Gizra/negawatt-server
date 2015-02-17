'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:UsageCtrl
 * @description
 * # UsageCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('UsageCtrl', function ($scope, $q, $location, $stateParams, account, usage, meters, ChartUsage) {
    // Get data from the cache, since 'usage' might not be up to date
    // after lazy-load.
    $scope.frequencies = ChartUsage.getFrequencies();
    $scope.usageChartData = $scope.usageChartData || {};
    $scope.cssStyle = 'height:210px; width:500px;';

    //angular.extend($scope.usageChartData, {}, ChartUsage.getConfig());
    //  Add Configuration.
    angular.extend($scope.usageChartData, {
      "type": "ColumnChart",
      "data": [
        ['Year', 'Sales', 'Expenses', 'Profit'],
        ['2014', 1000, 400, 200],
        ['2015', 1170, 460, 250],
        ['2016', 660, 1120, 300],
        ['2017', 1030, 540, 350]
      ],
      "options": {
        "isStacked": true,
        "bar": {
          "groupWidth": "75%"
        },
        "vAxis": {
          "title": "קוט\"ש ביום",
          "gridlines": {
            "count": 6
          }
        },
        "hAxis": {
          "title": "תאריך"
        }
      }
    });

    $scope.select = function() {
      $scope.usageChartData.type = ($scope.usageChartData.type === 'ColumnChart') ? 'LineChart' : 'ColumnChart';
    }

    //angular.extend($scope.usageChartData.data, ChartUsage.getData());
    //
    //var updateChart;
    //
    //var chart = ChartUsage.get(account.id, $stateParams)
    //// Revolve promise
    //chart.then(function(data) {
    //  $scope.usageChartData = angular.copy(data);
    //  chart = undefined;
    //  debugger;
    //});
    //
    //
    ///**
    // * Search the data with the new chart frequency.
    // */
    //$scope.select = function() {
    //
    //  // Prevent only one excetion.
    //  if ($stateParams.chartFreq !== this.frequencies[this.$index].type) {
    //    $scope.usageChartData.displayed = false;
    //    //debugger;
    //    $stateParams.chartFreq = this.frequencies[this.$index].type;
    //    // Load electricity data in the chart according the chart frequency.
    //    $scope.isLoading = true;
    //
    //    updateChart = $q.when(chart || ChartUsage.get(account.id, $stateParams));
    //    updateChart.then(function(response) {
    //      if (chart) {
    //        console.log('select chart');
    //        $scope.usageChartData = data;
    //        chart = undefined;
    //      }
    //      else {
    //        console.log('select update');
    //        //$scope.usageChartData.data.rows = response.data.rows;
    //        $scope.isLoading = false;
    //      }
    //    });
    //
    //    $location.search('chartFreq', $stateParams.chartFreq);
    //  }
    //}
    //
    //// Active the seleced chart frequency.
    //function setActiveFrequencyTab(frequency) {
    //  frequency.active = true;
    //}
    //if (angular.isDefined($stateParams.chartFreq)) {
    //  setActiveFrequencyTab($scope.frequencies[$stateParams.chartFreq-1])
    //}
    //
    //// Detail information of the selected marker.
    //if (angular.isDefined($stateParams.markerId)) {
    //  // Share meter selected.
    //  $scope.meterSelected = meters[$stateParams.markerId];
    //
    //  // Chart usage information of the selected marker.
    //  ChartUsage.meterSelected(meters[$stateParams.markerId]);
    //}
    //
    //// Handle lazy-load of electricity data.
    //// When cache expands, update the chart.
    //$scope.$on("nwElectricityChanged", function(event, filtersHash) {
    //
    //  // Don't update usageChartData if we're not in the active request.
    //  if (filtersHash != ChartUsage.getActiveRequestHash()) {
    //    return;
    //  }
    //
    //  ChartUsage.getByFiltersHash(filtersHash).then(function(response) {
    //    $scope.usageChartData.data.rows = response.data.rows;
    //    //$scope.usageChartData = data;
    //  });
    //});

  });
