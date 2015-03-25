'use strict';

/**
 * @ngdoc overview
 * @name negawattClientApp
 * @description
 * # negawattClientApp
 *
 * Main module of the application.
 */
angular
  .module('negawattClientApp', [
    'angularMoment',
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'leaflet-directive',
    'config',
    'LocalStorageModule',
    'ui.router',
    'googlechart',
    'angular-md5',
    'angular-loading-bar',
    'ui.bootstrap.tabs',
    'template/tabs/tab.html',
    'template/tabs/tabset.html',
    'angularMoment'
  ])
  .config(function ($stateProvider, $urlRouterProvider, $httpProvider, cfpLoadingBarProvider) {
    // Complete urls if Route not defined in the $stateProvider.
    $urlRouterProvider.when('/login/', '/login');
    $urlRouterProvider.when('/logout/', '/logout');
    $urlRouterProvider.when('/dashboard/', '/');
    // For any unmatched url, redirect to '/'.
    $urlRouterProvider.otherwise('/');

    // Setup the states.
    $stateProvider
      // path: /#/login
      .state('login', {
        url: '/login',
        templateUrl: 'views/login.html'
      })
      // path: /#/logout
      .state('logout', {
        url: '/logout',
        template: '<ui-view/>',
        controller: function(Auth, $state) {
          Auth.logout();
          $state.go('login');
        }
      })
      .state('main', {
        url: '/',
        templateUrl: 'views/dashboard/menu.html',
        resolve: {
          profile: function(Profile) {
            return Profile.get();
          }
        },
        controller: 'MainCtrl',
      })
      .state('main.menu', {
        abstract: true,
        templateUrl: 'views/dashboard/menu.html',
        controller: 'MenuCtrl',
      })
      .state('main.menu.map', {
        url: 'home',
        resolve: {
          meters: function(Meter, account, $stateParams, Category) {
            // Get first 100 records.
            return Meter.get(account.id);
          }
        },
        templateUrl: 'views/dashboard/menu.map.html',
        controller: 'MapCtrl',
      });

    // Define interceptors.
    $httpProvider.interceptors.push(function ($q, Auth, $location, localStorageService) {
      return {
        'request': function (config) {
          if (!config.url.match(/login-token/)) {
            config.headers = {
              'access-token': localStorageService.get('access_token')
            };
          }
          return config;
        },
        'response': function(result) {
          if (result.data.access_token) {
            localStorageService.set('access_token', result.data.access_token);
          }
          return result;
        },
        'responseError': function (response) {
          if (response.status === 401) {
            Auth.authFailed();
          }
          return $q.reject(response);
        }
      };
    });

    // Configuration of the loading bar.
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.latencyThreshold = 1000;

  })
  .run(function ($rootScope, $state, $stateParams, $log, Config, amMoment) {
    // MomentJS internationalization.
    amMoment.changeLocale('he');

    // It's very handy to add references to $state and $stateParams to the
    // $rootScope so that you can access them from any scope within your
    // applications.For example:
    // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
    // to active whenever 'contacts.list' or one of its decendents is active.
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    if (!!Config.debugUiRouter) {
      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        $log.log('$stateChangeStart to ' + toState.to + '- fired when the transition begins. toState,toParams : \n', toState, toParams);
      });

      $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams) {
        $log.error('$stateChangeError - fired when an error occurs during transition.');
        $log.log(arguments);
      });

      $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $log.info('$stateChangeSuccess to ' + toState.name + '- fired once the state transition is complete.');
        $log.log(arguments);
      });

      //$rootScope.$on('$viewContentLoaded', function (event) {
      //  $log.log('$viewContentLoaded - fired after dom rendered', event);
      //});

      $rootScope.$on('$stateNotFound', function (event, unfoundState, fromState, fromParams) {
        $log.error('$stateNotFound ' + unfoundState.to + '  - fired when a state cannot be found by its name.');
        $log.log(unfoundState, fromState, fromParams);
      });
    }

  });

