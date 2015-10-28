'use strict';

angular.module('negawattClientApp')
  .service('Message', function ($q, $http, $rootScope, $state, $timeout, $sce, Config, moment) {

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
      var url = Config.backend + '/api/notifications?sort=-timestamp&filter[meter_account]=' + account.id;
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
        // Prepare event timestamp in month format.
        message['date'] = moment.unix(message.timestamp).format('YYYY-MM');

        message['text'] = !!message.description && message.description
          || !!message.address && message.address
          || !!message.title && message.title
          || '';
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
