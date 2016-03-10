'use strict';

angular.module('negawattClientApp')
  .controller('MapCtrl', function ($scope, $state, $stateParams, $location, $filter, Map, leafletData, $timeout, account, sensorTree) {
    var mapCtrl = this;  
    var isMeterSelected = false;

    // Config map.
    mapCtrl.defaults = Map.getConfig();
    mapCtrl.center = Map.getCenter(account);
    // Build sites/meters list from sensorTree.
    var sites = [];
    angular.forEach(sensorTree.collection, function(item) {
      // If it's a site or a meter, add it to sites array.
      if (item.type == 'site' || item.type == 'meter') {
        if (item.location) {
          // Set lat/lng.
          item.lat = Number(item.location.lat);
          item.lng = Number(item.location.lng);

          // Set icon.
          var parentCategory = sensorTree.collection[item.parent];
          var categoryIcon = parentCategory && parentCategory.icon ? parentCategory.icon : 'marker';
          item.icon = {
            iconUrl: '../images/markers/' + categoryIcon + '-blue.png',
            shadowUrl: '../images/shadow.png',
            iconSize: [32, 32], // size of the icon
            shadowSize: [20, 20],
            iconAnchor: [16, 29], // point of the icon which will correspond to marker's location
            shadowAnchor: [10, 12],  // the same for the shadow
            popupAnchor: [0, -25], // where the pop-up window will appear
            //unselect: {
            //  iconUrl: '../images/markers/' + categoryIcon + '-blue.png',
            //  shadowUrl: '../images/shadow.png',
            //  iconSize: [32, 32], // size of the icon
            //  shadowSize: [20, 20],
            //  iconAnchor: [16, 29], // point of the icon which will correspond to marker's location
            //  shadowAnchor: [10, 12],  // the same for the shadow
            //  popupAnchor: [0, -25], // where the pop-up window will appear
            //},
            //select: {
            //  iconUrl: '../images/markers/' + categoryIcon + '-red.png',
            //  shadowUrl: '../images/shadow.png',
            //  iconSize: [32, 32], // size of the icon
            //  shadowSize: [20, 20],
            //  iconAnchor: [16, 29], // point of the icon which will correspond to marker's location
            //  shadowAnchor: [10, 12],  // the same for the shadow
            //  popupAnchor: [0, -25], // where the pop-up window will appear
            //}
          };
          sites.push(item);
        }
      }
    });
    mapCtrl.sites = sites;
    //mapCtrl.sites = ($state.is('dashboard.withAccount')) ? meters.listAll : getMetersWithOptions(meters.list);

    // Select marker if is the case.
    if ($stateParams.sel && $stateParams.sel == 'site') {
      isMeterSelected = !!setSelectedMarker($stateParams.ids);
    }

    /**
    * Set the selected Meter.
    *
    * @param ids int
    *   The Marker ID.
    */
    function setSelectedMarker(ids) {
      // FIXME: handle multiple ids.
      var lastSelectedMarkerId = Map.getMarkerSelected();
      // Unselect the previous marker.
      if (angular.isDefined(lastSelectedMarkerId) && angular.isDefined(mapCtrl.sites[lastSelectedMarkerId])) {
        mapCtrl.sites[Map.getMarkerSelected()].unselect()
      }

      // Select the marker.
      if (angular.isDefined(mapCtrl.sites[ids])) {
        mapCtrl.sites[ids].select();
        Map.setMarkerSelected(ids);
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
          .setView([mapCtrl.center.lat, mapCtrl.center.lng], mapCtrl.center.zoom, {reset: true});
      });
    });

    // Reload the current $state when meters added more.
    $scope.$on('nwMetersChanged', function(event, meters) {
      //mapCtrl.sites = getMetersWithOptions(meters.list);
      //if (FilterFactory.get('meter') && mapCtrl.sites[FilterFactory.get('meter')] && !isMeterSelected) {
      //  setSelectedMarker(FilterFactory.get('meter'));
      //}
    });

    // Select marker in the Map.
    $scope.$on('leafletDirectiveMarker.click', function(event, args) {
//      $state.forceGo('dashboard.withAccount.markers', {markerId: args.modelName, categoryId: FilterFactory.get('category')} );
      $stateParams.sel = 'site';
      $stateParams.ids = args.modelName;
    });

    /**
     * Apply style to the markers according the active filters.
     *
     * @param meters
     *  Collection of meters.
     *
     * @returns {*}
     */
    function getMetersWithOptions(meters) {
//      return (FilterFactory.isDefine('category')) ? $filter('setMetersOptionsByActiveCategory')(angular.copy(meters), {transparent: true}, 'noActiveCategory') : meters;
    }

  });
