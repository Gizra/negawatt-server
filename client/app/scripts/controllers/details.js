'use strict';

angular.module('negawattClientApp')
  .controller('DetailsCtrl', function ($scope, $state, $stateParams, FilterFactory, ChartCategories, meters, $filter, categories) {
    // Category id selected from pie chart.
    var categoryId;
    // Summary property of electricity.
    var summary;

    $scope.categories = categories;
    $scope.meters = meters;
    // The initialization in a empty object is need it to avoid an error in the initial rendering.
    //$scope.categoriesChart = categoriesChart;
    $scope.categoriesChart = {};

    // Go to the a new category selected form the pie chart.
    $scope.onSelect = function(selectedItem, chartData) {
      if (summary.type === 'category') {
        categoryId = ChartCategories.getCategoryIdSelected(selectedItem, chartData);
        if (angular.isDefined(categoryId)) {
          $state.go('dashboard.withAccount.categories', {accountId: $stateParams.accountId, categoryId: categoryId});
        }
      }
    };


    /**
     * Electricity Service Event: When electricity change update Pie chart of
     * consumption, according the summary data.
     */
    $scope.$on("nwElectricityChanged", function(event, electricity) {
      var labels;
      // Get summary data from electricity.
      summary = $filter('summary')(electricity[FilterFactory.get('activeElectricityHash')]);

      if (angular.isUndefined(summary)) {
        return;
      }

      // Set collection (Categories | Meters) to add labels on the pie chart. According the summary type data.
      labels = (summary.type === 'category') ? $scope.categories.collection : $scope.meters.listAll;

      // Prepare the content as Google Chart Dataset object definition.
      $scope.categoriesChart = $filter('toPieChartDataset')(summary, labels);
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

    if ($stateParams.markerId) {
      setSelectedMarker($stateParams.markerId);
    }
  });
