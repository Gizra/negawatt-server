/**
 * @ngdoc filter
 * @name ui.router.state.filter:includedByParams
 *
 * @requires ui.router.state.$stateParams
 *
 * @description
 * Translates to {@link ui.router.state.$state#methods_includes $state.includes('fullOrPartialStateName')}.
 */

angular.module('negawattClientApp')
  .filter('includedByParams', function ($state, $stateParams) {
    var includesFilter = function (param, expression) {
      return (angular.isDefined($stateParams[param]) && $stateParams[param] && +$stateParams[param] === expression);
    };
    return includesFilter;
  });
