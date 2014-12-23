'use strict';

angular.module('negawattClientApp')
  .service('Message', function ($q, $http, $rootScope, $state, $timeout, $sce, Config) {

    // A private cache key.
    var cache = {
    };

    /**
     * Return the promise with the meter list, from cache or the server.
     *
     * @returns {*}
     */
    this.get = function() {
      return $q.when(cache.data || getDataFromBackend());
    };

    /**
     * Return messages array from the server.
     *
     * @returns {$q.promise}
     */
    function getDataFromBackend() {
      var deferred = $q.defer();
      var url = Config.backend + '/api/anomalous_consumption';
      $http({
        method: 'GET',
        url: url,
        transformResponse: prepareMessages
      }).success(function(messages) {
        setCache(messages);
        deferred.resolve(cache.data);
      });

      return deferred.promise;
    }

    /**
     * Transform response fix a valid url.
     *
     * @param response
     *    String with response data.
     * @returns {*[]}
     *
     */
    function prepareMessages(response) {
      var messages = angular.fromJson(response).data;

      // TODO: remove monkey patch after resolve issue:#210
      angular.forEach(messages, function(message) {
        message['long-text'] = message['long-text'].replace('%23', '#');
        message['long-text'] = message['long-text'].replace('90', '50');
        message['text'] = message['text'].replace('%23', '#');
        message['text'] = message['text'].replace('90', '50');
      });

      return messages;
    }

    /**
     * Save messages in cache, and broadcast an event to inform that the messages data changed.
     *
     * @param data
     */
    function setCache(data) {
      // Cache messages data.
      cache = {
        data: data,
        timestamp: new Date()
      };
      // Clear cache in 60 seconds.
      $timeout(function() {
        cache.data = undefined;
      }, 60000);
      $rootScope.$broadcast('negawatt.messages.changed');
    }
  });
