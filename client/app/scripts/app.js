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

    // Now set up the states.
    $stateProvider
      .state('login', {
        url: '/',
        templateUrl: 'views/login.html'
      })
      .state('dashboard', {
        url: '/dashboard',
        templateUrl: 'views/dashboard/dashboard.html',
        controller: 'DashboardCtrl'
      })
      .state('dashboard.login.failed', {
        url: 'login',
        templateUrl: 'views/partials/dashboard.login.html',
        controller: 'DashboardCtrl'
      })
      .state('dashboard.main', {
        url: '/main',
        templateUrl: 'views/dashboard/dashboard.main.html',
        controller: 'MapCtrl'
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

