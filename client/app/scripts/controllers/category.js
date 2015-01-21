'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller: CategoryCtrl
 * @description
 * # CategoryCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('CategoryCtrl', function ($scope, $state, $stateParams, Category, categories) {
    $scope.categories = categories;
    $scope.allCategories = categories;
    $scope.accountId = $stateParams.accountId;

     /**
     * Determine if a category has meters.
     *
     * @param category
     *  The category.
     *
     * @returns {boolean}
     *  It's true if the category has meters.
     */
    $scope.hasMeters = function(category) {
      return !!category.meters;
    };

    /**
     * Set the selected category.
     *
     * @param id int
     *   The Category ID.
     */
    function setSelectedCategory(id) {
      Category.setSelectedCategory(id);
    }

    if ($stateParams.categoryId) {
      setSelectedCategory($stateParams.categoryId);
    }

  });
