'use strict';

angular.module('negawattClientApp')
  .service('Profile', function ($q, $http, $timeout, $filter, $state, $rootScope, Config, localStorageService) {
    var self = this;

    // A private cache key.
    var cache = {};

    // Update event broadcast name.
    var broadcastUpdateEventName = 'nwProfileChanged';

    /**
     * Return the active account.
     *
     * @returns {*}
     *  The account object.
     */
    function getActiveAccount() {
      return localStorageService.get('activeAccount');
    }

    /**
     * Return the promise with the account, from cache or the server.
     *
     * @returns {*}
     */
    this.get = function() {
      return $q.when(cache.data || getDataFromBackend());
    };

    /**
     * Select from a account id the active account to use in the application.
     *
     * @param accountId
     *  The account ID comming form the URL params.
     *
     * @returns {*}
     *  The account object selected.
     */
    this.selectActiveAccount = function(accountId) {
      var active;
      var accounts = cache.data && cache.data.account;

      // if account undefined throw an error.
      if (angular.isUndefined(accounts)) {
        throw 'Undefined accounts, is not possible select an active account.'
      }

      // Defined as active account the first object of the account.
      if (cache.account && angular.isUndefined(accountId)) {
        active = cache.account[Object.keys(cache.account)[0]];
      }
      else if (cache.account && cache.account[accountId]) {
        active = cache.account[accountId];
      }
      else {
        // Get select the account as active.
        active = undefined;
      }

      // Get select the account as active.
      localStorageService.set('activeAccount', active);

      // Clear app cache, if new account was selected or there not define the active account.
      $rootScope.$broadcast('nwClearCache');

    };

    /**
     * Return a promise of an profile object object from the server.
     *
     * The Profile object have the information of the account and the user session.
     *
     * @returns {$q.promise}
     */
    function getDataFromBackend() {
      var getProfile,
        deferred = $q.defer();

      getProfile = $q.all([getUserData(), getAccountData()]);
      getProfile.then(function(data) {
        setCache(data);
        deferred.resolve(cache.data);
      });

      return deferred.promise;
    }

    /**
     * Return account array from the server.
     *
     * @returns {$q.promise}
     */
    function getUserData() {
      var url = Config.backend + '/api/me';
      return $http({
        method: 'GET',
        url: url,
        transformResponse: prepareUserData
      });
    }

    /**
     * Return account array from the server.
     *
     * @returns {$q.promise}
     */
    function getAccountData() {
      var url = Config.backend + '/api/accounts';
      return $http({
        method: 'GET',
        url: url,
        transformResponse: prepareAccountData
      });

    }

    /**
     * Save account in cache, and broadcast en event to inform that the account data changed.
     *
     * @param data
     */
    function setCache(data) {
      // Cache account data.
      cache = {
        data: {
          user: data[0].data,
          account: data[1].data
        },
        timestamp: new Date()
      };
      // Clear cache in 60 seconds.
      $timeout(function() {
        cache.data = undefined;
      }, 60000);
      $rootScope.$broadcast(broadcastUpdateEventName);
    }


    /**
     * Prepare user session information.
     *
     * @param data - {string}
     *   User information.
     *
     * @returns {*}
     *   User object, extended with new methods.
     */
    function prepareUserData(data) {
      // Return  serialized to an object.
      return angular.fromJson(data).data;
    }

    /**
     * Prepare account information.
     *
     * @param data - {string}
     *   Account information.
     *
     * @returns {*}
     *   object with user information and methods.
     */
    function prepareAccountData(data) {
      if (!data) {
        return;
      }

      // Convert response serialized to an object.
      var accounts = angular.fromJson(data);

      if (!accounts) {
        // Response code was a 401.
        return;
      }

      angular.forEach(accounts.data, function(account, index) {
        // Convert center information for leafleat Map.
        account.center = {
          lat: parseFloat(account.location.lat),
          lng: parseFloat(account.location.lng),
          zoom: parseInt(account.zoom)
        };

        delete account.location;
        delete account.zoom;
      });


      return accounts.data;
    }

    $rootScope.$on('nwClearCache', function() {
      cache = {};
    });

  });
