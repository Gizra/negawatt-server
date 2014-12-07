'use strict';

angular.module('negawattClientApp')
  .service('Meter', function ($q, $http, $timeout, NegawattConfig, $rootScope) {
    var Meter = this;

    // A private cache key.
    var cache = {};

    /**
     * Return the promise with the meter list, from cache or the server.
     *
     * @returns {*}
     */
    this.get = function() {
      return $q.when(cache.data || getMeters());
    };

    /**
     * Return meters array from the server.
     *
     * @returns {$q.promise}
     */
    function getMeters() {
      var deferred = $q.defer();
      var url = NegawattConfig.backend + '/api/iec_meters';
      $http({
        method: 'GET',
        url: url,
        transformResponse: prepareMetersForLeafletMarkers
      }).success(function(meters) {
        save(meters);
        deferred.resolve(cache.data);
      });

      return deferred.promise;
    }

    /**
     * Save meters in cache, and broadcast en event to inform that the meters data changed.
     *
     * @param meters
     */
    function save(meters) {
      // Cache meters data.
      cache = {
        data: meters,
        timestamp: new Date()
      };
      Meter.data = cache;
      // Clear cache in 60 seconds.
      $timeout(function() {
        cache.data = undefined;
      }, 60000);
      $rootScope.$broadcast('negawatt.meters.changed');
    }


    /**
     * Convert the array of list of meters to and object of meters.
     *
     * Also prepare the lang and lat values so Leaflet can pick them up.
     *
     * @param list []
     *   List of meters in an array.
     *
     * @returns {*}
     *   List of meters organized in an object, each meter it's a property keyed
     *   by the id.
     */
    function prepareMetersForLeafletMarkers(list) {
      var meters = {};

      // Convert response serialized to an object.
      if (angular.isString(list)) {
        list = angular.fromJson(list).data;
      }

      angular.forEach(list, function(item) {
        meters[item.id] = item;

        // Convert the geo location properties as expected by leaflet map.
        if (item.location) {
          meters[item.id].lat = parseFloat(item.location.lat);
          meters[item.id].lng = parseFloat(item.location.lng);

          delete item['location'];
        }
      });

      return meters;
    }

  });
