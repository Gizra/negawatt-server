'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:MainCtrl
 * @description
 * # DashboardCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('DashboardCtrl', function ($scope, $state, $stateParams, Meter, Map, meters, messages, mapConfig, categories, profile) {
    // Set Map initial center position, according the account.
    Map.setCenter(profile.account.center);

    // Initialize values.
    $scope.defaults = mapConfig;
    $scope.meters = meters;
    $scope.center = Map.getCenter();
    $scope.messages = messages;
    $scope.categories = categories;
    $scope.profile = profile;

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
    }

    if ($stateParams.markerId) {
      setSelectedMarker($stateParams.markerId);
    }

    // Select marker in the Map.
    $scope.$on('leafletDirectiveMarker.click', function(event, args) {
      $state.go('dashboard.controls.markers', {markerId: args.markerName});
    });

  });
