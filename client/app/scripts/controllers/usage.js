'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:MainCtrl
 * @description
 * # DashboardCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('UsageCtrl', function ($scope, usage) {
    $scope.usageChart = usage;
  });
