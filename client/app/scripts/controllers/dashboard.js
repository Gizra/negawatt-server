'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:MainCtrl
 * @description
 * # DashboardCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('DashboardCtrl', function ($scope, $state, $stateParams, Meter, Map, meters, mapConfig, categories, session) {

    // Initialize values.
    $scope.defaults = mapConfig;
    $scope.center = Map.getCenter();
    $scope.meters = meters;
    $scope.categories = categories;
    $scope.session = session;

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
      $state.go('dashboard.markers', {id: args.markerName});
    });

  });
