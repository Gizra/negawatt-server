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
    'angularMoment',
    'ui.indeterminate',
    'negawattDirectives'
  ])
  .config(function ($stateProvider, $urlRouterProvider, $httpProvider, cfpLoadingBarProvider) {
    // Handle state 'dashboard' activation via browser url '/'
    $urlRouterProvider.when('', '/');
    $urlRouterProvider.when('/', function($injector, $location, $state, Profile) {
      Profile.get().then(function(profile) {
        if (profile) {
          $state.go('dashboard.withAccount', {accountId: profile.account[0].id});
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
        templateUrl: 'views/dashboard/main.html',
        resolve: {
          profile: function(Profile) {
            return Profile.get();
          }
        },
        controller: 'DashboardCtrl'
      })
      .state('dashboard.withAccount', {
        url: '/{accountId:int}?{chartFreq:int}&{chartNextPeriod:int}&{chartPreviousPeriod:int}',
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
          meters: function(Meter, account, $stateParams, Category, FilterFactory) {
            // Get first records.
            return Meter.get(account.id);
          },
          categories: function(Category, account) {
            return Category.get(account.id);
          },
          filters: function(FilterFactory, categories, $stateParams, meters, account) {
            // Define categories filters. Used for the UI Checknboxes.
            FilterFactory.set('categorized', categories);
            // Define electricity parameters
            FilterFactory.set('electricity', $stateParams);

            return {
              loadElectricity: true,
              limits: meters.summary.electricity_time_interval,
              activeElectricityHash: FilterFactory.get('activeElectricityHash')
            };
          },
          messages: function(Message) {
            return Message.get();
          }
        },
        views: {
          'menu@dashboard': {
            templateUrl: 'views/dashboard/main.menu.html',
            controller: 'MenuCtrl'
          },
          'map@dashboard': {
            templateUrl: 'views/dashboard/main.map.html',
            controller: 'MapCtrl'
          },
          'categories@dashboard': {
            templateUrl: 'views/dashboard/main.categories.html',
            controller: 'CategoryCtrl'
          },
          'messages@dashboard': {
            templateUrl: 'views/dashboard/main.messages.html',
            controller: 'MessageCtrl'
          },
          'details@dashboard': {
            templateUrl: 'views/dashboard/main.details.html',
            resolve: {
              categoriesChart: function(ChartCategories, account, categories, $stateParams) {
                return ChartCategories.get(account.id, $stateParams.categoryId, categories.collection);
              }
            },
            controller: 'DetailsCtrl'
          },
          'usage@dashboard': {
            templateUrl: 'views/dashboard/main.usage.html',
            controller: 'UsageCtrl',
            controllerAs: 'chart'
          }
        }
      })
      .state('dashboard.withAccount.categories', {
        url: '/category/{categoryId:int}',
        reloadOnSearch: false,
        resolve: {
          meters: function(Meter, $stateParams, account, FilterFactory) {
            // Set Meter filter.
            FilterFactory.set('category', +$stateParams.categoryId);

            return Meter.get(account.id, $stateParams.categoryId);
          },
          categories: function(Category, account, categories) {
            return Category.get(account.id);
          },
          filters: function(categories, $stateParams, FilterFactory) {
            return {
              loadElectricity: true,
              limits: categories.collection[$stateParams.categoryId].electricity_time_interval,
              activeElectricityHash: FilterFactory.get('activeElectricityHash')
            };
          }
        },
        views: {
          // Replace `meters` data previous resolved, with the cached data
          // filtered by the selected category.
          'map@dashboard': {
            templateUrl: 'views/dashboard/main.map.html',
            controller: 'MapCtrl'
          },
          // Update usage-chart to show category summary.
          'usage@dashboard': {
            templateUrl: 'views/dashboard/main.usage.html',
            controller: 'UsageCtrl',
            controllerAs: 'chart'
          },
          'categories@dashboard': {
            templateUrl: 'views/dashboard/main.categories.html',
            controller: 'CategoryCtrl'
          },
          // Update details (pie) chart for categories.
          'details@dashboard': {
            templateUrl: 'views/dashboard/main.details.html',
            resolve: {
              categoriesChart: function(ChartCategories, $stateParams, account, categories) {
                return ChartCategories.get(account.id, $stateParams.categoryId, categories.collection);
              }
            },
            controller: 'DetailsCtrl'
          }
        }
      })
      .state('dashboard.withAccount.markers', {
        url: '/marker/:markerId?categoryId',
        reloadOnSearch: false,
        resolve: {
          meters: function(Meter, $stateParams, account, FilterFactory) {
            FilterFactory.set('category', +$stateParams.categoryId || undefined);
            FilterFactory.set('meter', +$stateParams.markerId);
            // Necessary to resolve again to apply the filter, of category id.
            return Meter.get(account.id, $stateParams.categoryId);
          },
          categories: function(Category, account, categories) {
            return Category.get(account.id);
          },
          filters: function(meters, $stateParams, FilterFactory) {
            return {
              loadElectricity: true,
              limits: meters.list[$stateParams.markerId] && meters.list[$stateParams.markerId].electricity_time_interval || {},
              activeElectricityHash: FilterFactory.get('activeElectricityHash')
            };
          }
        },
        views: {
          // Replace `meters` data previous resolved, with the cached data
          // if is the case filtered by the selected category.
          'map@dashboard': {
            templateUrl: 'views/dashboard/main.map.html',
            controller: 'MapCtrl'
          },
          'categories@dashboard': {
            templateUrl: 'views/dashboard/main.categories.html',
            controller: 'CategoryCtrl'
          },
          // Update the meter detailed data.
          'details@dashboard': {
            templateUrl: 'views/dashboard/main.details.html',
            resolve: {
              // Keep angular.noop because need to resolve with an empty function 'function(){}',
              // null or {} doesn't works.
              categoriesChart: angular.noop
            },
            controller: 'DetailsCtrl'
          },
          'usage@dashboard': {
            templateUrl: 'views/dashboard/main.usage.html',
            controller: 'UsageCtrl',
            controllerAs: 'chart'
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

