'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:DetailsCtrl
 * @description
 *  Details chart controller.
 *
 * Controller for the details (pie) chart, in dashboard mode.
 */

angular.module('negawattClientApp')
  .controller('DetailsCtrl', function ($scope, $state, $stateParams, FilterFactory, Chart, ChartCategories, meters, $filter, siteCategories) {
    var detailsCtrl = this;
    // Category id selected from pie chart.
    var categoryId;
    // Summary property of electricity.
    var summary;

    $scope.categories = siteCategories;
    $scope.meters = meters;

    // Public controller API
    detailsCtrl.categoriesChart = {};
    detailsCtrl.message = Chart.messages.empty;
    detailsCtrl.hasData = hasData;
    // Save dataset values, until wait for load the dataset labels
    // (in the data type meters).
    detailsCtrl.dataset;

    if ($stateParams.markerId) {
      setSelectedMarker($stateParams.markerId);
      meterSelectedExist();
    }

    // Go to the a new category selected form the pie chart.
    $scope.onSelect = function(selectedItem, chartData) {
      if (summary.type === 'site_categories') {
        categoryId = ChartCategories.getCategoryIdSelected(selectedItem, chartData);
        if (angular.isDefined(categoryId)) {
          $state.go('dashboard.withAccount.categories', {accountId: $stateParams.accountId, categoryId: categoryId});
        }
      }
    };

    // Select the meter when is comming with the 'lazy load'
    $scope.$on('nwMetersChanged', function(event, meters) {
      $scope.meterSelected = meters.list[$stateParams.markerId];

      detailsCtrl.metersLoaded = meters.loaded;
      if (meters.loaded) {
        meterSelectedExist();
        render();
      }
    });

    /**
     * Electricity Service Event: When electricity change update Pie chart of
     * consumption, according the summary data.
     */
    $scope.$on('nwElectricityChanged', function(event, electricity) {
      if (angular.isDefined($stateParams.markerId)) {
        return;
      }

      var labels;
      // Get summary data from electricity.
      summary = $filter('summary')(electricity[FilterFactory.get('activeElectricityHash')]);

      if (angular.isUndefined(summary)) {
        return;
      }

      // Set collection (Categories | Meters) to add labels on the pie chart. According the summary type data.
      if (summary.type === 'site_categories') {
        labels = $scope.categories.collection;
        renderChart(summary, labels);
      }
      else {
        labels = {};
        detailsCtrl.dataset = {
          summary: summary,
          labels: labels
        }
      }

      // Render pie chart in case of electricity data update.
      detailsCtrl.metersLoaded = meters.loaded;
      if (detailsCtrl.metersLoaded) {
        render();
      }
    });

    /**
     * Set the selected Meter.
     *
     * @param id int
     *   The Marker ID.
     */
    function setSelectedMarker(id) {
      // Use in the widget 'Details'.
      $scope.meterSelected = meters.list[id];
    }

    /**
     * Return true is there are electricity data to show the chart,
     * otherwise false.
     *
     * @returns {boolean}
     */
    function hasData() {
      return detailsCtrl.categoriesChart.data && !!detailsCtrl.categoriesChart.data.rows.length;
    }

    // Generate alert if the a meter is selected and is not defined in the UI.
    function render() {
      // Render pie chart.
      if (angular.isDefined(detailsCtrl.dataset)) {
        renderChart(detailsCtrl.dataset.summary, $scope.meters.listAll);
      }
    }

    /**
     * Render piw chart with summary information and
     *
     * @param summary
     * @param labels
     */
    function renderChart(summary, labels) {
      // Prepare the content as Google Chart Dataset object definition.
      detailsCtrl.categoriesChart = $filter('toPieChartDataset')(summary, labels);
    }

    function meterSelectedExist() {
      // Handle applications alerts.
      if (angular.isUndefined($scope.meterSelected) && $state.is('dashboard.withAccount.markers')) {
        $scope.detailsCtrl.alerts.new({type: 'default', msg: 'מונה לא קיים.'});
      }
    }
  });
