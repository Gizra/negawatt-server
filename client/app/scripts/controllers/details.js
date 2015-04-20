'use strict';

angular.module('negawattClientApp')
  .controller('DetailsCtrl', function ($scope, $state, $stateParams, ChartCategories, categoriesChart, meters) {
    var categoryId;
    // The initialization in a empty object is need it to avoid an error in the initial rendering.
    $scope.categoriesChart = categoriesChart;

    // Select category form the pie chart.
    $scope.onSelect = function(selectedItem, chartData) {
      categoryId = ChartCategories.getCategoryIdSelected(selectedItem, chartData);
      if (angular.isDefined(categoryId)) {
        $state.go('dashboard.withAccount.categories', {accountId: $stateParams.accountId, categoryId: categoryId, chartNextPeriod: undefined, chartPreviousPeriod: undefined});
      }
    };

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
