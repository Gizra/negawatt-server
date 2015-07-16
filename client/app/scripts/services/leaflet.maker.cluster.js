'use strict';

angular.module('negawattClientApp')
  .service('leafletMarkerCluster', function (leafletData) {
    var map;

    this.map = getMap;

    function getMap() {
      map = leafletData.getMap()
        .then(function(response) {
          return response;
        });

      return map;
    }

  });
