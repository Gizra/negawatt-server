'use strict';

angular.module('negawattClientApp')
  // TODO: remove dependency on Site, Meter
  .service('SensorTree', function ($q, $http, $timeout, $state, $rootScope, $filter, Config, Utils, Site, Meter, FilterFactory) {
    var self = this;

    // A private cache key.
    var cache = {};

    // Promise in progress of sensorsTree.
    var getSensorsTree;

    // Update event broadcast name.
    var broadcastUpdateEventName = 'nwSiteSensorsTreeChanged';

    /**
     * Return the promise with the sensors-tree, from cache or the server.
     *
     * @param accountId - int
     *  The account ID.
     *
     * @return {$q.promise}
     */
    this.get = function(accountId) {

      getSensorsTree = $q.when(getSensorsTree || sensorsTreeData() || getSensorsTreeFromServer(accountId));

      // Prepare the sensorsTree object.
      getSensorsTree = prepareSensorsTree(getSensorsTree);

      // Clear the promise cached, after resolve or reject the promise. Permit access to the cache data, when
      // the promise execution is done (finally).
      getSensorsTree.finally(function getSensorsTreeFinally() {
        getSensorsTree = undefined;
      });

      return getSensorsTree;
    };

    /**
     * Reset the sensors-tree filters.
     */
    //this.reset = function() {
    //  FilterFactory.setSensorsTree(sensorsTreeData());
    //};

    /**
     * Return site-sensorsTree array from the server.
     *
     * @return {$q.promise}
     */
    function getSensorsTreeFromServer(accountId) {
      var deferred = $q.defer();
      var url = Config.backend + '/api/sensor_tree';
      var params = {account: accountId, XDEBUG_SESSION_START: 11770};
      $http({
        method: 'GET',
        url: url,
        params: params,
        cache: true
      }).success(function(sensorsTree) {
        deferred.resolve(sensorsTree.data);
      });

      return deferred.promise;
    }

    /**
     * Save sensorsTree in cache, and broadcast en event to inform that the sensorsTree data changed.
     *
     * @param data
     *    Collection resulted from the request.
     */
    function setCache(data) {
      // Cache sensorsTree data.
      cache = {
        data: data,
        timestamp: new Date()
      };
      // Clear cache in 60 minutes.
      $timeout(function() {
        cache.data = undefined;
      }, 3600000);
      $rootScope.$broadcast(broadcastUpdateEventName);
    }

    /**
     * Convert sensorsTree data from flat collection to a tree structure.
     *
     * Prepare sensorsTree object with tree and collection indexed by id.
     *
     * @param getSensorsTree - {$q.promise)
     *  Promise of list of sensorsTree, comming from cache or the server.
     *
     * @return {$q.promise}
     *  A promise for sensorsTree object.
     */
    function prepareSensorsTree(getSensorsTree) {
      var deferred = $q.defer();

      // Get all the sites.
      getSensorsTree
        .then(function prepareSensorsTreeResolve(collection) {
          // Convert the array of sensorsTree to an object with properties list, collection and tree.
          var sensorsTree = {};

          // SensorsTree in an original collection array.
          // SensorsTree indexed by id, used to easy select a sensorsTree.
          sensorsTree.collection = collection;
          // SensorsTree in tree model, used for angular-ui-tree directive.
          sensorsTree.tree = convertSensorCollectionToTree(collection);

          setCache(sensorsTree);
          deferred.resolve(sensorsTreeData());
        });

      return deferred.promise;
    }

    /**
     * Convert sensorsTree from a flat collection to a tree model.
     *
     * @param collection
     *    Collection of sensorsTree.
     *
     * @return {*}
     *  SensorsTree in a tree model.
     */
    function convertSensorCollectionToTree(collection) {
      var sensorTree = {};

      // Replace children category ID for the category it self.
      angular.forEach(collection, function(item, key) {
        if (item.parent) {
          sensorTree[item.parent].children[key] = item;
        }
        else {
          sensorTree[key] = item;
        }
      });

      return sensorTree;
    }

    /**
     * Return the sensor-tree data from the cache.
     */
    function sensorsTreeData() {
      return cache.data;
    }

    $rootScope.$on('nwClearCache', function() {
      cache = {};
    });

  });
