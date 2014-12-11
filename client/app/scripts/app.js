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
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'leaflet-directive',
    'config',
    'LocalStorageModule',
    'ui.router'
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
        templateUrl: 'views/dashboard/main.html',
        url: '/dashboard',
        resolve: {
          meters: function(Meter) {
            return Meter.get();
          },
          mapConfig: function(Map) {
            return Map.getConfig();
          },
          categories: function(Category) {
            return Category.get()
          },
          session: function(Session) {
            return Session.get();
          }
        },
        controller: 'DashboardCtrl'
      })
      .state('dashboard.markers', {
        url: '/marker/:id',
        controller: 'DashboardCtrl'
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

  });

