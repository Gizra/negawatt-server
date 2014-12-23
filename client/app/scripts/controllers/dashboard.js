'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:MainCtrl
 * @description
 * # DashboardCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('DashboardCtrl', function ($scope, $state, $stateParams, ChartUsage, Meter, Map, meters, messages, mapConfig, categories, profile, usage) {
    // Set Map initial center position, according the account.
    Map.setCenter(profile.account.center);

    // Initialize values.
    $scope.defaults = mapConfig;
    $scope.meters = meters;
    $scope.center = Map.getCenter();
    $scope.messages = messages;
    $scope.categories = categories;
    $scope.profile = profile;
    $scope.usageChart = usage;

    /**
     * Set the selected Meter.
     *
     * @param id int
     *   The Marker ID.
     */
    function setSelectedMarker(id) {
      $scope.meters[id].select();
      // Use in the widget 'Details'.
      $scope.meterSelected = $scope.meters[id];
      // Let ChartUsage set chart title
      ChartUsage.meterSelected($scope.meterSelected);
    }

    if ($stateParams.markerId) {
      setSelectedMarker($stateParams.markerId);
    }

    // Select marker in the Map.
    $scope.$on('leafletDirectiveMarker.click', function(event, args) {
      $state.go('dashboard.controls.markers', {markerId: args.markerName});
    });

    var openedPopup = null;

    // Hover above marker in the Map -  open tooltip
    $scope.$on("leafletDirectiveMarker.mouseover", function(event, args) {
      var leafletId = args.markerName;
      // If this popup is already opened, do nothing
      if ($stateParams.openedPopup == leafletId) {
        return;
      }
      // Open tooltip popup window
      $stateParams.openedPopup = leafletId;
      var leaflet = args.leafletEvent.target;
      leaflet.openPopup();
    });

    // Hover out of marker in the Map - close tooltip
    $scope.$on("leafletDirectiveMarker.mouseout", function(event, args) {
      var leaflet = args.leafletEvent.target;
      leaflet.closePopup();
      $stateParams.openedPopup = null;
    });

  });
