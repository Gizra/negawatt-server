'use strict';

angular.module('negawattClientApp')
  .controller('MapCtrl', function ($scope, $state, $stateParams, $location, $filter, Map, leafletData, $timeout, account, meters, FilterFactory) {
    var vm = this;  
    var isMeterSelected = false;

    // Config map.
    vm.defaults = Map.getConfig();
    vm.center = Map.getCenter(account);
    // The first time always loadd all the meters.
    vm.meters = ($state.is('dashboard.withAccount')) ? meters.listAll : getMetersWithOptions(meters.list);

    // Select marker if is the case.
    if ($stateParams.markerId) {
      isMeterSelected = !!setSelectedMarker($stateParams.markerId);
    }

    /**
    * Set the selected Meter.
    *
    * @param id int
    *   The Marker ID.
    */
    function setSelectedMarker(id) {
      var lastSelectedMarkerId = Map.getMarkerSelected();
      // Unselect the previous marker.
      if (angular.isDefined(lastSelectedMarkerId) && angular.isDefined(vm.meters[lastSelectedMarkerId])) {
        vm.meters[Map.getMarkerSelected()].unselect()
      }

      // Select the marker.
      if (angular.isDefined(vm.meters[id])) {
        vm.meters[id].select();
        Map.setMarkerSelected(id);
        isMeterSelected = true;
      }

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

    // Check when the map is loaded.
    $scope.$on("leafletDirectiveMap.load", function(events, map) {
      leafletData.getMap().then(function(map){
        map.setActiveArea('map-activearea')
          .setView([vm.center.lat, vm.center.lng], vm.center.zoom, {reset: true});
      });
    });

    // Reload the current $state when meters added more.
    $scope.$on('nwMetersChanged', function(event, meters) {
      vm.meters = getMetersWithOptions(meters.list);
      if (FilterFactory.get('meter') && vm.meters[FilterFactory.get('meter')] && !isMeterSelected) {
        setSelectedMarker(FilterFactory.get('meter'));
      }
    });

    // Select marker in the Map.
    $scope.$on('leafletDirectiveMarker.click', function(event, args) {
      $state.forceGo('dashboard.withAccount.markers', {markerId: args.modelName, categoryId: FilterFactory.get('category')} );
    });

    /**
    * Set the selected Meter.
    *
    * @param id int
    *   The Marker ID.
    */
    function setSelectedMarker(id) {
      var lastSelectedMarkerId = Map.getMarkerSelected();
      // Unselect the previous marker.
      if (angular.isDefined(lastSelectedMarkerId) && angular.isDefined(vm.meters[lastSelectedMarkerId])) {
        vm.meters[Map.getMarkerSelected()].unselect()
      }

      // Select the marker.
      if (angular.isDefined(vm.meters[id])) {
        vm.meters[id].select();
        Map.setMarkerSelected(id);
        isMeterSelected = true;
      }
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
