'use strict';

angular.module('negawattClientApp')
  .controller('MapCtrl', function ($scope, $state, $stateParams, $location, $filter, Category, Map, leafletData, $timeout, account, meters, FilterFactory) {
    var isMeterSelected = false;

    // Config map.
    $scope.defaults = Map.getConfig();
    $scope.center = Map.getCenter(account);
    $scope.layers = {
      baselayers: {
        osm: {
          name: 'OpenStreetMap',
          type: 'xyz',
          url: 'https://{s}.tiles.mapbox.com/v3/examples.map-i87786ca/{z}/{x}/{y}.png'
        }
      },
      overlays: {
        realworld: {
          name: "Cluster",
          type: "markercluster",
          layerOptions: {
            animateAddingMarkers: false,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: false,
            spiderfyDistanceMultiplier: 2
          },
          visible: true
        }
      }
    };

    $scope.meters = getMetersWithOptions(meters.list);

    if ($stateParams.markerId) {
      isMeterSelected = setSelectedMarker($stateParams.markerId);
    }

    // Hover above marker in the Map -  open tooltip.
    $scope.$on("leafletDirectiveMarker.mouseover", function(event, args) {
      var leafletId = args.markerName;
      // If this popup is already opened, do nothing.
      if ($stateParams.openedPopup === leafletId) {
        return;
      }
      // Open tooltip popup window.
      $stateParams.openedPopup = leafletId;
      var leaflet = args.leafletEvent.target;
      leaflet.openPopup();
    });

    // Hover out of marker in the Map - close tooltip.
    $scope.$on("leafletDirectiveMarker.mouseout", function(event, args) {
      var leaflet = args.leafletEvent.target;
      leaflet.closePopup();
      $stateParams.openedPopup = null;
    });

    // Save the center of the map every time this is moved.
    $scope.$on("leafletDirectiveMap.dragend", function() {
      leafletData.getMap().then(function(map){
        Map.setCenter(map.getCenter());
      });
    });

    // Check when the map is loaded.
    $scope.$on("leafletDirectiveMap.zoomend", function() {
      leafletData.getMap().then(function(map){
        Map.updateCenterZoom(map.getZoom());
      });
    });

    // Reload the current $state when meters added more.
    $scope.$on('nwMetersChanged', function(event, meters) {
      $scope.meters = getMetersWithOptions(meters.list);

      if (FilterFactory.get('meter') && $scope.meters[FilterFactory.get('meter')] && !isMeterSelected) {
        setSelectedMarker(FilterFactory.get('meter'));
      }
    });

    // Select marker in the Map.
    $scope.$on('leafletDirectiveMarker.click', function(event, args) {
      $state.forceGo('dashboard.withAccount.markers', {markerId: args.modelName, categoryId: FilterFactory.get('category'), chartNextPeriod: undefined, chartPreviousPeriod: undefined} );
    });

    /**
    * Set the selected Meter.
    *
    * @param id int
    *   The Marker ID.
    */
    function setSelectedMarker(id) {
      // $timeout works as helper to select marker after the map it's loaded.
      $timeout(function() {
        var lastSelectedMarkerId = Map.getMarkerSelected();
        // Unselect the previous marker.
        if (angular.isDefined(lastSelectedMarkerId) && angular.isDefined($scope.meters[lastSelectedMarkerId])) {
          $scope.meters[Map.getMarkerSelected()].unselect()
        }

        // Select the marker.
        if (angular.isDefined($scope.meters[id])) {
          $scope.meters[id].select();
          Map.setMarkerSelected(id);
          isMeterSelected = true;
        }
      });
    }

    /**
     * Apply style to the markers according the active filters.
     *
     * @param meters
     *  Collection of meters.
     *
     * @returns {*}
     */
    function getMetersWithOptions(meters) {
      return (FilterFactory.isDefine('category')) ? $filter('setMetersOptionsByActiveCategory')(angular.copy(meters), {transparent: true}, 'noActiveCategory') : meters;
    }

  });
