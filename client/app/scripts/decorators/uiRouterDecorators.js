

angular.module('negawattClientApp')
  .config(function ($provide) {
    $provide.decorator('$state', function($delegate) {
      var extend = angular.extend;
      var isDefined = angular.isDefined;
      var isUndefined = angular.isUndefined;
      var states = {};

      $delegate.go = function go(to, params, options) {
        console.log('$state.go decorated.')

        if (isUndefined(states[to])) {
          states[to] = {
            reloadOnSearch: $delegate.$current.reloadOnSearch
          };
        }
        $delegate.$current.reloadOnSearch = states[to].reloadOnSearch;
        console.log($delegate.$current.name, $delegate.$current.reloadOnSearch);

        return $delegate.transitionTo(to, params, extend({ inherit: true, relative: $delegate.$current }, options));
      };

      $delegate.mustGo = function go(to, params, options) {
        console.log('$state.mustGo decorated.')

        $delegate.current.reloadOnSearch = true;
        console.log($delegate.$current.name, $delegate.$current.reloadOnSearch);

        return $delegate.transitionTo(to, params, extend({ inherit: true, relative: $delegate.$current }, options));
      };


      return $delegate;
    });
});
