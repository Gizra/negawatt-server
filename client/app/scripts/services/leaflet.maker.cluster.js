'use strict';

angular.module('negawattClientApp')
  .service('leafletMarkerCluster', function (leafletData) {
    var map;

    this.map = getMap;

    function getMap() {
      leafletData.getMap()
        .then(resolveMap);

      return map;
    }

    function resolveMap(response) {
      debugger;
      // Create plugin
      var oms = new OverlappingMarkerSpiderfier(map);

      oms.addListener('click', function(marker) {
        debugger;
        popup.setContent(marker.desc);
        popup.setLatLng(marker.getLatLng());
        map.openPopup(popup);
      });
      oms.addListener('spiderfy', function(markers) {
        debugger;
        for (var i = 0, len = markers.length; i < len; i ++) markers[i].setIcon(new lightIcon());
        map.closePopup();
      });
      oms.addListener('unspiderfy', function(markers) {
        debugger;
        for (var i = 0, len = markers.length; i < len; i ++) markers[i].setIcon(new darkIcon());
      });


      map = response;
    }

  });
