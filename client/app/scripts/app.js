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
    'angular-md5'
  ])
  .config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
    // For any unmatched url, redirect to '/'.
    $urlRouterProvider.otherwise('/dashboard');

    // Setup the states.
    $stateProvider
      .state('login', {
        url: '/',
        templateUrl: 'views/login.html'
      })
      .state('dashboard', {
        abstract: true,
        templateUrl: 'views/dashboard/main.html',
        resolve: {
          meters: function(Meter) {
            return Meter.get();
          },
          messages: function(Message) {
            return Message.get();
          },
          mapConfig: function(Map) {
            return Map.getConfig();
          },
          categories: function(Category) {
            return Category.get();
          },
          profile: function(Profile) {
            return Profile.get();
          },
          usage: function(ChartUsage) {
            return ChartUsage.get();
          }
        },
        controller: 'DashboardCtrl'
      })
      .state('dashboard.controls',  {
        url: '/dashboard',
        views: {
          map: {
            templateUrl: 'views/dashboard/main.map.html'
          },
          menu: {
            templateUrl: 'views/dashboard/main.menu.html'
          },
          categories: {
            templateUrl: 'views/dashboard/main.categories.html'
          },
          messages: {
            templateUrl: 'views/dashboard/main.messages.html'
          },
          details: {
            templateUrl: 'views/dashboard/main.details.html',
            resolve: {
              categoriesChart: function(ChartCategories) {
                return ChartCategories.get();
              }
            },
            controller: 'CategoryCtrl'
          },
          usage: {
            templateUrl: 'views/dashboard/main.usage.html',
            resolve: {
              meters: function(meters) {
                return meters;
              }
            },
            controller: 'DashboardCtrl'
          }
        }
      })
      .state('dashboard.controls.categories', {
        url: '/category/:categoryId',
        views: {
          // Replace the map that was set by the parent state, with markers filtered by the selected category.
          'map@dashboard': {
            templateUrl: 'views/dashboard/main.map.html',
            resolve: {
              meters: function(Meter, $stateParams) {
                return Meter.get($stateParams.categoryId);
              }
            },
            controller: 'DashboardCtrl'
          },
          // Update chart of categories.
          'details@dashboard': {
            templateUrl: 'views/dashboard/main.details.html',
            resolve: {
              categoriesChart: function(ChartCategories, $stateParams) {
                return ChartCategories.get($stateParams.categoryId);
              }
            },
            controller: 'CategoryCtrl'
          }
        }
      })
      .state('dashboard.controls.markers', {
        url: '/marker/:markerId?categoryId',
        views: {
          // Update the meter detailed data.
          'details@dashboard': {
            templateUrl: 'views/dashboard/main.details.html',
            controller: 'DetailsCtrl'
          },
          // Update electricity-usage chart in 'usage' sub view
          'map@dashboard': {
            templateUrl: 'views/dashboard/main.map.html',
            resolve: {
              meters: function(Meter, Category, $stateParams) {
                return Meter.get($stateParams.categoryId);
              }
            },
            controller: 'DashboardCtrl'
          },
          // Replace the map that was set by the parent state, with markers filtered by the selected category.
          'usage@dashboard': {
            templateUrl: 'views/dashboard/main.usage.html',
            resolve: {
              usage: function(ChartUsage, $stateParams) {
                return ChartUsage.get('meter', $stateParams.markerId);
              }
            },
            controller: 'UsageCtrl'
          }
        }
      });

    // Define interceptors.
    $httpProvider.interceptors.push(function ($q, Auth, $location, localStorageService) {
      return {
        'request': function (config) {
          if (!config.url.match(/login-token/)) {
            config.headers = {
              'access_token': localStorageService.get('access_token')
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

  })
  .run(function ($rootScope, $state, $stateParams, $log, Config) {
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
        $log.log('$stateChangeError - fired when an error occurs during transition.');
        $log.log(arguments);
      });

      $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $log.log('$stateChangeSuccess to ' + toState.name + '- fired once the state transition is complete.');
      });

      $rootScope.$on('$viewContentLoaded', function (event) {
        $log.log('$viewContentLoaded - fired after dom rendered', event);
      });

      $rootScope.$on('$stateNotFound', function (event, unfoundState, fromState, fromParams) {
        $log.log('$stateNotFound ' + unfoundState.to + '  - fired when a state cannot be found by its name.');
        $log.log(unfoundState, fromState, fromParams);
      });
    }
  });

