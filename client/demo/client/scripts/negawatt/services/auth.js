'use strict';

angular.module('app')
  .service('Auth', function($http, Utils, NegawattConfig) {
    /**
     * Login by calling the Drupal REST server.
     *
     * @param user
     *   Object with the properties "username" and "password".
     *
     * @returns {*}
     */
    this.login = function(user) {
      return $http({
        method: 'GET',
        url: NegawattConfig.backend + '/api/login-token',
        headers: {
          'Authorization': 'Basic ' + Utils.Base64.encode(user.username + ':' + user.password)
        }
      });
    };
  });
