'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:MainCtrl
 * @description
 * # DashboardCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('CategoriesCtrl', function ($scope, $state, Auth) {
    // Configure, center the Map and Load he Meters.
    //$scope.categories = categoriesCollection;

    console.log('CategoriesCtrl');
    // If the user is not authenticated, goto login state.
    if (!Auth.isAuthenticated()) {
      $state.go('login');
    }


  });
