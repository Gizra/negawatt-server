'use strict';

angular.module('negawattClientApp')
  .controller('MapCtrl', function ($scope, $state, $stateParams, $location, $filter, Map, leafletData, $timeout, account, sensorTree, ApplicationState) {
    var mapCtrl = this;

    // Expose functions.
    mapCtrl.setSelectedMarkers = setSelectedMarkers;

    // Local fields.
    var isMeterSelected = false;

    // Config map.
    mapCtrl.defaults = Map.getConfig();
    mapCtrl.center = Map.getCenter(account);
    // Build sites/meters list from sensorTree.
    var sites = {};
    angular.forEach(sensorTree.collection, function(item) {
      // If it's a site or a meter, add it to sites array.
      if (item.type == 'site' || item.type == 'meter') {
        if (item.location) {
          // Set lat/lng.
          item.lat = Number(item.location.lat);
          item.lng = Number(item.location.lng);

          // Add selection functions.
          item.select = function() { item.icon = item.selectedIcon; }
          item.unselect = function() { item.icon = item.unselectedIcon; }

          // Set icon.
          var parentCategory = sensorTree.collection[item.parent];
          var categoryIcon = parentCategory && parentCategory.icon ? parentCategory.icon : 'marker';
          item.unselectedIcon = {
            iconUrl: '../images/markers/' + categoryIcon + '-blue.png',
            shadowUrl: '../images/shadow.png',
            iconSize: [32, 32], // size of the icon
            shadowSize: [20, 20],
            iconAnchor: [16, 29], // point of the icon which will correspond to marker's location
            shadowAnchor: [10, 12],  // the same for the shadow
            popupAnchor: [0, -25] // where the pop-up window will appear
          };
          item.selectedIcon = {
              iconUrl: '../images/markers/' + categoryIcon + '-red.png',
              shadowUrl: '../images/shadow.png',
              iconSize: [32, 32], // size of the icon
              shadowSize: [20, 20],
              iconAnchor: [16, 29], // point of the icon which will correspond to marker's location
              shadowAnchor: [10, 12],  // the same for the shadow
              popupAnchor: [0, -25] // where the pop-up window will appear
          };
          // Initially, all markers are unselected.
          item.unselect();

          // Add to sites list.
          sites[item.id] = item;
        }
      }
    });
    mapCtrl.sites = sites;

    // Register with appState.
    ApplicationState.registerMap(this);

    // Select marker if is the case.
    if ($stateParams.sel && ($stateParams.sel == 'site' || $stateParams.sel == 'meter')) {
      isMeterSelected = !!setSelectedMarkers($stateParams.ids);
    }

    /**
    * Set the selected Meter.
    *
    * @param ids string
    *   Comma separated list of Marker IDs.
    */
    function setSelectedMarkers(ids) {
      // Unselect the previous markers.
      var lastSelectedMarkerIds = Map.getMarkersSelected();
      angular.forEach(lastSelectedMarkerIds, function (id) {
        if (angular.isDefined(mapCtrl.sites[id])) {
          mapCtrl.sites[id].unselect()
        }
      });

      // Select the marker.
      var newSelectedMarkerIds = ids.split(',');
      angular.forEach(newSelectedMarkerIds, function (id) {
        if (angular.isDefined(mapCtrl.sites[id])) {
          mapCtrl.sites[id].select();
        }
      });
      Map.setMarkersSelected(newSelectedMarkerIds);
      isMeterSelected = (newSelectedMarkerIds.length > 0);
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
          .setView([mapCtrl.center.lat, mapCtrl.center.lng], mapCtrl.center.zoom, {reset: true});
      });
    });

    // Reload the current $state when meters added more.
    $scope.$on('nwMetersChanged', function(event, meters) {
      //mapCtrl.sites = getMetersWithOptions(meters.list);
      //if (FilterFactory.get('meter') && mapCtrl.sites[FilterFactory.get('meter')] && !isMeterSelected) {
      //  setSelectedMarkers(FilterFactory.get('meter'));
      //}
    });

    // Select marker in the Map.
    $scope.$on('leafletDirectiveMarker.click', function(event, args) {
      ApplicationState.updateSelection(args.model.type, args.model.id, $stateParams.norm, true);
    });
  });
