'use strict';

/**
 * Dashboard controller.
 */
angular.module('app')
  .controller('DashboardCtrl', function ($scope, Account, Meter, Electricity, ChartLine, Category) {
    // Initialization need by the leaflet directive.
    $scope.center = {};
    $scope.events = {};

    // Get initial data from server.
    Account.getAccount()
      .then(function(response) {
        $scope.account = response.data;

        // Center of the map, according the account.
        $scope.center = $scope.account.location;

        Meter.get().then(function(response) {
          Meter.cache = $scope.meters = response.data;

          // Load the total of consumption of the markers in the map.
          Electricity.get()
            .then(ChartLine.getLineChartTotals)
            .then(function(response) {
              $scope.line = {
                data: response.data,
                options: response.options
              };
            });

          // Filter categories to show only the categories, define in the meters.
          // Category.filterByMeterCategories(Meter.cache);

        });

      });

    // Methods.

    /**
     * Remove the filter by category.
     */
    $scope.refreshMap = function() {
      $scope.meters = Meter.cache;
      $scope.categorySelected = undefined;
    };

    // Observers.
    $scope.$on('leafletDirectiveMarker.click', function(event, args){
      $scope.meterSelected = $scope.meters[args.markerName];
      $scope.$broadcast('negawatt.markerSelected', $scope.meterSelected);
    });

    $scope.$on('negawatt.account.loaded', function(event, account) {
      $scope.account = account;
    });

    $scope.$on('negawatt.category.filterBy', function(event, id) {
      $scope.meters = Meter.filterBy(id);
      $scope.categorySelected = Category.labelFilteredCategoryById(id);
    });

  });
