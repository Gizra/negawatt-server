'use strict';

angular.module('negawattClientApp')
  .service('Message', function ($q, $http, $rootScope, $state, $timeout, $sce, Config) {

    // A private cache key.
    var cache = {};

    // Update event broadcast name.
    var broadcastUpdateEventName = 'nwMessagesChanged';

    /**
     * Return the promise with the meter list, from cache or the server.
     *
     * @returns {*}
     */
    this.get = function(account) {
      return $q.when(cache.data || getDataFromBackend(account));
    };

    /**
     * Return messages array from the server.
     *
     * @returns {$q.promise}
     */
    function getDataFromBackend(account) {

      var deferred = $q.defer();
      var url = Config.backend + '/api/anomalous_consumption?sort=-timestamp&filter[meter_account]=' + account.id;
      $http({
        method: 'GET',
        url: url,
        transformResponse: prepareMessages,
        cache: true
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

      angular.forEach(messages, function(message) {
        // Build meter-url with meter description and a link to select the meter.
        var meterUrl = '<a href="/#/dashboard/' + message['meter_account'] + '/marker/' + message['meter'] + '">' + message['place_description'] + '</a>';

        // Replace '!meter_url' placeholder by the URL.
        if (angular.isDefined(message['long-text'])) {
          message['long-text'] = message['long-text'].replace('!meter_url', meterUrl);
        }
        if (angular.isDefined(message['text'])) {
          message['text'] = message['text'].replace('!meter_url', meterUrl);
        }
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
      $rootScope.$broadcast(broadcastUpdateEventName);
    }

    $rootScope.$on('nwClearCache', function() {
      cache = {};
    });
  });
