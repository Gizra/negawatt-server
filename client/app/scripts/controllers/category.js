'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller: CategoryCtrl
 * @description
 * # CategoryCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('CategoryCtrl', function ($scope, categoriesChart) {
    $scope.categoriesChart = categoriesChart;
  });
