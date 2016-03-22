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
    'ui.bootstrap.alert',
    'ui.bootstrap.accordion',
    'ui.bootstrap.buttons',
    'ui.bootstrap.datepicker',
    'template/datepicker/datepicker.html',
    'template/datepicker/popup.html',
    'template/datepicker/day.html',
    'template/datepicker/month.html',
    'template/datepicker/year.html',
    'template/tabs/tab.html',
    'template/tabs/tabset.html',
    'template/alert/alert.html',
    'template/accordion/accordion-group.html',
    'template/accordion/accordion.html',
    'angularMoment',
    'ui.indeterminate',
    'angular.filter',
    'ui.tree'
  ])
  .config(function ($stateProvider, $urlRouterProvider, $httpProvider, cfpLoadingBarProvider) {
    // Handle state 'dashboard' activation via browser url '/'
    $urlRouterProvider.when('', '/');
    $urlRouterProvider.when('/', function($injector, $location, $state, Profile) {
      Profile.get().then(function(profile) {
        if (profile) {
          $state.go('chart.withAccount', {accountId: profile.account[0].id});
        }
      });
    });

    // For any unmatched url, redirect to '/'.
    $urlRouterProvider.otherwise('');

    // Setup the states.
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'views/login.html'
      })
      .state('logout', {
        url: '/logout',
        template: '<ui-view/>',
        controller: function(Auth, $state) {
          Auth.logout();
          $state.go('login');
        }
      })
      .state('dashboard', {
        abstract: true,
        url: '/dashboard',
        templateUrl: 'views/dashboard/map/main.html',
        resolve: {
          profile: function(Profile) {
            return Profile.get();
          }
        },
        controller: 'DashboardCtrl'
      })
      .state('dashboard.withAccount', {
        url: '/{accountId:int}?{chartFreq:int}&{sel}&{ids}&{sensor}&{norm}&{chartType}&{chartNextPeriod:int}&{chartPreviousPeriod:int}',
        reloadOnSearch: false,
        params: {
          chartFreq: {
            // Keep monthly chart type by default.
            value: 2
          }
        },
        resolve: {
          account: function($stateParams, Profile, profile) {
            return Profile.selectAccount($stateParams.accountId, profile);
          },
          meterCategories: function(MeterCategory, account) {
            return MeterCategory.get(account.id);
          },
          sensorTree: function(SensorTree, account) {
            return SensorTree.get(account.id);
          },
          sensorType: function(SensorType, account) {
            return SensorType.get(account.id);
          },
          messages: function(Message, account) {
            return Message.get(account);
          }
        },
        views: {
          'menu@dashboard': {
            templateUrl: 'views/dashboard/map/main.menu.html',
            controller: 'MenuCtrl'
          },
          'map': {
            templateUrl: 'views/dashboard/map/main.map.html',
            controller: 'MapCtrl',
            controllerAs: 'map'
          },
          'meters-menu@dashboard': {
            templateUrl: 'views/dashboard/map/main.meters-menu.html',
            controller: 'MetersMenuCtrl',
            controllerAs: 'metersMenuCtrl'
          },
          'messages@dashboard': {
            templateUrl: 'views/dashboard/map/main.messages.html',
            controller: 'MessageCtrl',
            controllerAs: 'message'
          },
          'details@dashboard': {
            templateUrl: 'views/dashboard/map/main.details.html'
          },
          'usage@dashboard': {
            templateUrl: 'views/dashboard/map/main.usage.html',
            controller: 'UsageCtrl',
            controllerAs: 'chart'
          }
        }
      })
      .state('chart', {
        abstract: true,
        url: '/chart',
        templateUrl: 'views/dashboard/chart/main.html',
        resolve: {
          profile: function(Profile) {
            return Profile.get();
          }
        },
        controller: 'DashboardCtrl'
      })
      .state('chart.withAccount', {
        url: '/{accountId:int}?{chartFreq:int}&{sel}&{ids}&{sensor}&{norm}&{chartType}&{chartNextPeriod:int}&{chartPreviousPeriod:int}',
        reloadOnSearch: false,
        params: {
          chartFreq: {
            // Keep monthly chart type by default.
            value: 2
          }
        },
        resolve: {
          account: function($stateParams, Profile, profile) {
            return Profile.selectAccount($stateParams.accountId, profile);
          },
          meterCategories: function(MeterCategory, account) {
            return MeterCategory.get(account.id);
          },
          sensorTree: function(SensorTree, account) {
            return SensorTree.get(account.id);
          },
          sensorType: function(SensorType, account) {
            return SensorType.get(account.id);
          },
          messages: function(Message, account) {
            return Message.get(account);
          }
        },
        views: {
          'menu@chart': {
            templateUrl: 'views/dashboard/chart/main.menu.html',
            controller: 'MenuCtrl'
          },
          'meters-menu@chart': {
            templateUrl: 'views/dashboard/chart/main.meters-menu.html',
            controller: 'MetersMenuCtrl',
            controllerAs: 'metersMenuCtrl'
          },
          'messages@chart': {
            templateUrl: 'views/dashboard/chart/main.messages.html',
            controller: 'MessageCtrl',
            controllerAs: 'message'
          },
          'usage@chart': {
            templateUrl: 'views/dashboard/chart/main.usage.html',
            controller: 'DetailedChartCtrl',
            controllerAs: 'detailedChartCtrl'
          }
        }
      });
    // Define interceptors.
    $httpProvider.interceptors.push(function ($q, Auth, $location, localStorageService) {
      return {
        'request': function (config) {
          if (!config.withoutToken && !config.url.match(/.html/)) {
            angular.extend(config.headers, {
              'access-token': localStorageService.get('access_token')
            });
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
    // <li ng-class='{ active: $state.includes('contacts.list') }'> will set the <li>
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
