'use strict';

angular.module('app')
  .service('Message', function Message($q, $http) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var data = {};

    /**
     * Get all the messages according an specific detector id.
     *
     * @param id
     * @returns {*}
     */
    this.getMessagesByDetectorId = function(id) {
      var deferred = $q.defer();

      $http({
        method: 'GET',
        url: 'messages.json',
        serverPredefined: true
      }).success(function(messages) {
          data.messages = messages;

          deferred.resolve(data.messages);
        });

      // Return object.
      return deferred.promise;
    };

  });
