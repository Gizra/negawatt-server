'use strict';

angular.module('app')
  .controller('CategoryCtrl', function($scope, Category, $rootScope) {

    // Select last year report like default.
    $scope.categories = {};

    // Load Categories.
    Category.getCategories().then(function(response) {
      Category.cache = $scope.categories = response.data.data;
    });

    // Filter map markers by id.
    $scope.filterBy = function(id) {
      // Sent the event to all the application.
      $rootScope.$broadcast('negawatt.category.filterBy', id);
    };

    // Observers.
    $scope.$on('negawatt.category.filtered', function(event, categories) {
      $scope.categories = categories;
    });

  });
