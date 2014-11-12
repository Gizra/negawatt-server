  'use strict';
  angular.module('app', [
    'ngRoute',
    'ngAnimate',
    'ui.bootstrap',
    'easypiechart',
    'ui.tree',
    'ngMap',
    'ngTagsInput',
    'leaflet-directive',
    'app.controllers',
    'app.directives',
    'app.localization',
    'app.nav',
    'app.ui.ctrls',
    'app.ui.directives',
    'app.ui.services',
    'app.ui.map',
    'app.form.validation',
    'app.ui.form.ctrls',
    'app.ui.form.directives',
    'app.tables',
    'app.task',
    'app.chart.ctrls',
    'app.chart.directives',
    'app.page.ctrls',
    'angularMoment',
    'tc.chartjs',
    'LocalStorageModule'
  ]).config(
    function($routeProvider, $httpProvider, localStorageServiceProvider) {
      var routes;

      function setRoutes(route) {
        var config, url;
        url = '/' + route;
        config = {
          templateUrl: 'views/' + route + '.html'
        };
        $routeProvider.when(url, config);
        return $routeProvider;
      }

      // Handle routes.
      routes = ['dashboard', 'ui/typography', 'ui/buttons', 'ui/icons', 'ui/grids', 'ui/widgets', 'ui/components', 'ui/boxes', 'ui/timeline', 'ui/nested-lists', 'ui/pricing-tables', 'ui/maps', 'tables/static', 'tables/dynamic', 'tables/responsive', 'forms/elements', 'forms/layouts', 'forms/validation', 'forms/wizard', 'charts/charts', 'charts/flot', 'pages/404', 'pages/500', 'pages/blank', 'pages/forgot-password', 'pages/invoice', 'pages/lock-screen', 'pages/profile', 'pages/invoice', 'pages/signin', 'pages/signup', 'mail/compose', 'mail/inbox', 'mail/single', 'tasks/tasks'];

      routes.forEach(function(route) {
        return setRoutes(route);
      });

      $routeProvider.when('/', {
        redirectTo: '/dashboard'
      }).when('/404', {
        templateUrl: 'views/pages/404.html'
      }).otherwise({
        redirectTo: '/404'
      });

      // Define interceptors.
      $httpProvider.interceptors.push(function ($q, $location, localStorageService) {
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
              $location.url('pages/signin');
            }

            return $q.reject(response);
          }
        };
      });

      // Use x-www-form-urlencoded Content-Type.
      $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

      localStorageServiceProvider.setPrefix('negawatt');

    }
  );

