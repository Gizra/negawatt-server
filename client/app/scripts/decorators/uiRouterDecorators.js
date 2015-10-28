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
    $provide.decorator('$state', function($delegate, $urlRouter, $location, $stateParams, Utils) {
      var copy = angular.copy;
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

      /**
       * Update the resolved object in the global and views defined in the states.
       *
       * @param name
       *  Name of the object to be updated.
       * @param obj
       *  New object.
       */
      $delegate.setGlobal = function setGlobal(name, obj) {
        if (angular.isUndefined($delegate.$current.locals.globals[name])) {
          return;
        }
        // Access to the resolved property, in each view defined and the globals.
        var locals = $delegate.$current.locals;
        angular.forEach(locals, function(local, key) {
          if (key === 'resolve') {
            return;
          }
          // Update property.
          local[name] = obj;
        })
      };

      /**
       * Update update params values with reloadOnSearch:false.
       *
       * @param params
       *  Object of the change for the $stateParams.
       */
      $delegate.refreshUrlWith = function refreshUrlWith(params) {
        // Remove empty properties.
        angular.forEach($stateParams, function(item, key) {
          if (item === null) {
            delete $stateParams[key];
          }
        });

        // Update $location with the search values.
        $location.url($urlRouter.href($delegate.$current.url, $stateParams).slice(1));

        // Sync router.
        $urlRouter.sync();
      };

      return $delegate;
    });

});
