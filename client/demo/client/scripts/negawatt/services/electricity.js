'use strict';

angular.module('app')
  .service('Electricity', function ($q, $http, NegawattConfig, Utils) {

    /**
     * Return electricity consumption data (Kwh).
     *
     * @param {string} filters - query string to apply in the request.
     * @returns {$q.promise}
     */
    this.get = function(filters) {
      var url = NegawattConfig.backend + '/api/electricity' + Utils.createQueryString(filters);

      return $http({
        method: 'GET',
        url: url
      });
    };

  });
