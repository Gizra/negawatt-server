'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:MainCtrl
 * @description
 * # DashboardCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('DashboardCtrl', function ($scope, $state, $stateParams, Meter, Map, meters, mapConfig, categories, profile) {

    // Set Map initial center position, according the account.
    Map.setCenter(profile.account.center);

    // Initialize values.
    $scope.defaults = mapConfig;
    $scope.center = Map.getCenter();
    $scope.meters = meters;
    $scope.categories = categories;
    $scope.profile = profile;

    /**
     * Set the selected Meter.
     *
     * @param id int
     *   The Marker ID.
     */
    var setSelectedMarker = function(id) {
      $scope.meters[id].select();
    };

    if ($stateParams.id) {
      setSelectedMarker($stateParams.id);
    }

    // Select marker in the Map.
    $scope.$on('leafletDirectiveMarker.click', function(event, args) {
      $state.go('dashboard.controls.markers', {id: args.markerName});
    });

  });
