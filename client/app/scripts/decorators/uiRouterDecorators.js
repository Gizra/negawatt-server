'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.decorator:$state
 * @description
 * #
 * Add new method to force reload after query search
 */

angular.module('negawattClientApp')
  .config(function ($provide) {
    $provide.decorator('$state', function($delegate) {
      var extend = angular.extend;
      var isDefined = angular.isDefined;
      var isUndefined = angular.isUndefined;
      var states = {};

      /**
       * Extend $state.go method, to keep default value of property reloadOnSearch
       *
       * @param to
       * @param params
       * @param options
       * @returns {promise|void}
       */
      $delegate.go = function go(to, params, options) {
        // Save initial value of property reloadOnSearch per state.
        if (isUndefined(states[to])) {
          states[to] = {
            reloadOnSearch: $delegate.$current.reloadOnSearch
          };
        }
        // Set default value.
        $delegate.$current.reloadOnSearch = states[to].reloadOnSearch;
        return $delegate.transitionTo(to, params, extend({ inherit: true, relative: $delegate.$current }, options));
      };

      /**
       * Extend $state.go to force reload of state.
       *
       * @param to
       * @param params
       * @param options
       * @returns {promise|void}
       */
      $delegate.forceGo = function go(to, params, options) {
        // Force reload state.
        $delegate.current.reloadOnSearch = true;

        return $delegate.transitionTo(to, params, extend({ inherit: true, relative: $delegate.$current }, options));
      };

      return $delegate;
    });
});
