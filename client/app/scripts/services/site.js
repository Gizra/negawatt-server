'use strict';

angular.module('negawattClientApp')
  .service('Site', function ($q, $http, $timeout, $rootScope, $filter, Config, Marker, Utils, FilterFactory) {
    var self = this;

    // A private cache key.
    var cache = {};

    // Handle when reset the cache, this need it to handle multiple pagination data.
    var skipResetCache = false;

    // Force to only execute one request
    var getSites;

    // Update event broadcast name.
    var broadcastUpdateEventName = 'nwSitesChanged';

    /**
     * Return a promise with the list of sites, from cache or the server.
     *
     * @param accountId
     *  The account ID.
     * @param categoryId
     *  The category ID.
     *
     * @return {Promise}
     */
    this.get = function(accountId, categoryId) {
      // We return the promise in progress, cache data filtered or data from the server.
      getSites = $q.when(getSites || sitesFiltered() || getDataFromBackend(accountId));

      // Filtering in the case we have categoryId defined.
      if (angular.isDefined(categoryId)) {
        FilterFactory.set('category', categoryId);
      }

      // Clear the promise cached, after resolve or reject the promise. Permit access to the cache data, when
      // the promise excecution is done (finally).
      getSites.finally(function getSiteFinally() {
        getSites = undefined;
      });

      return getSites;
    };

    /**
     * Broadcast a notification of the site data and it filters had changed.
     */
    this.refresh = function() {
      // Broadcast and event to update the markers in the map.
      $rootScope.$broadcast(broadcastUpdateEventName, sitesFiltered());
    };

    /**
     * Return sites array from the server.
     *
     * @param accountId
     *  The account ID.
     * @param pageNumber
     *  The url for the next list (page) of sites.
     *
     * @return {$q.promise}
     */
    function getDataFromBackend(accountId, pageNumber) {
      var deferred = $q.defer();
      var url;
      pageNumber = pageNumber || 1;

      // Define endpoint with filters.
      // Get only sites that has electricity data.
      url = Config.backend + '/api/sites?'
        + '&filter[account]=' + accountId
        + '&page=' + pageNumber;

      $http({
        method: 'GET',
        url: url,
        transformResponse: prepareSitesForLeafletMarkers
      }).success(function(sites) {
        var hasNextPage = !!sites.next;
        setCache(sites.data, hasNextPage);

        // Resolve with the sites filtered from cache.data.
        deferred.resolve(sitesFiltered());

        // Update with the rest of the markers.
        if (hasNextPage) {
          skipResetCache = true;
          getDataFromBackend(accountId, getPageNumber(sites.next.href));
        }

        resetCache();
      });

      return deferred.promise;
    }

    /**
     * Save sites in cache, and broadcast en event to inform that the sites data changed.
     *
     * @param data
     *  The site list.
     * @param hasMore
     *  Indicate if has more data to request.
     */
    function setCache(data, hasMore) {
      var activeSite;

      if (angular.isUndefined(cache.data)) {
        cache.data = {
          // Save all the sites during the cache are avalible.
          listAll: {},
          // Keep the actual collection filtered, used to show into the map.
          list: {},
          // Interval information for electricity chart.
          summary: {},
          loaded: null
        };
      }

      // Extend sites properties explicit because we don have deep copy.
      // TODO: from angular v1.4 use angular.merge().
      angular.extend(cache.data.listAll, data && data.list);
      angular.extend(cache.data.summary, data && data.summary);
      // Save true if there is no more data to request, otherwise false.
      cache.data.loaded = !hasMore;
      cache.timestamp = new Date();

      // Broadcast and event to update the markers in the map.
      $rootScope.$broadcast(broadcastUpdateEventName, sitesFiltered());

      // Broadcast event that we have a activeSite
      activeSite = $filter('siteById')(cache.data.listAll, FilterFactory.get('site'));
      if (!Utils.isEmpty(activeSite) && activeSite.has_electricity) {
        // Broadcast and event to update the markers in the map.
        $rootScope.$broadcast('activeSite', activeSite);
      }

      // Active the reset after update the cache.
      skipResetCache = false;
    }

    /**
     * Reset the sites in the cache.
     */
    function resetCache() {
      if (skipResetCache) {
        return;
      }

      // Clear cache in 60 minutes.
      $timeout(function timeoutResetCache() {
        cache.data = undefined;
      }, 3600000);
    }

    /**
     * Convert the array of list of sites to and object of sites.
     *
     * Also prepare the lang and lat values so Leaflet can pick them up.
     *
     * @param response []
     *   Response List of sites in an array.
     *
     * @return {*}
     *   List of sites organized in an object, each site it's a property keyed
     *   by the id.
     */
    function prepareSitesForLeafletMarkers(response) {
      var sites = {};

      // Unserialize the response.
      response = angular.fromJson(response);

      // Save sites and the next request to get hasNextPage sites (if exist).
      sites = {
        data: {
          list: Utils.indexById(response.data)
        },
        next: response.next
      };

      angular.forEach(sites.data.list, function(item) {
        sites.data.list[item.id] = item;

        // Convert the geo location properties as expected by leaflet map.
        if (item.location) {
          sites.data.list[item.id].lat = parseFloat(item.location.lat);
          sites.data.list[item.id].lng = parseFloat(item.location.lng);

          delete item.location;
        }

        // Set site tooltip with image (if exists).
        var itemImage = item.image ? ('<img src="' + item.image.url + '"><br>') : '';
        sites.data.list[item.id].message = itemImage +
          item.place_description + '<br>' + item.place_address + '<br>' + item.place_locality;

        // Extend site with marker properties and methods.
        angular.extend(sites.data.list[item.id], Marker);

        // Define default icon properties and methods, in order, to be changed later.
        sites.data.list[item.id].unselect();
      });

      // Add summary property inside the site data object, as private property.
      sites.data.summary = response.summary;

      return sites;
    }

    /**
     * Return sites filter by the active filters.
     *
     * @return {*|cache.data|{list, total}}
     */
    function sitesFiltered() {
      if (angular.isDefined(cache.data)) {
        // Filter by categories filters unchecked (checkboxes).
        cache.data.list = (!FilterFactory.isDefine('category') && !FilterFactory.isDefine('site'))
          ? FilterFactory.byCategoryFilters(cache.data)
          : cache.data.listAll;
      }
      return cache.data;
    }

    /**
     * Return the number page from the url.
     *
     * @param url
     *    The url of the next page.
     */
    function getPageNumber(url) {
      var regex = /.*page=([0-9]*)/;

      return regex.exec(url).pop();
    }

    // Clear site cache.
    $rootScope.$on('nwClearCache', function() {
      cache = {};
    });

  });
