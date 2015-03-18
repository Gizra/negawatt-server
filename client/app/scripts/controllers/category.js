'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller: CategoryCtrl
 * @description
 * # CategoryCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('CategoryCtrl', function ($scope, $state, $stateParams, $filter, Category, Meter, categories, meters) {

    // Define property in the parent scope, permit to be accesable
    // by scope methods of the controller.
    $scope.categoriesChecked = {};

    $scope.categories = categories;
    $scope.accountId = $stateParams.accountId;
    $scope.chartFreq = $stateParams.chartFreq;

    // Activate filter of meters only if we are in the principal state.
    if ($state.is('dashboard.withAccount')) {
      $scope.filterMeters = true;
    }

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
     * Check/Unckeck category to filter meters over the map.
     *
     */
    $scope.toggleMetersByCategory = function() {
      // Update meters on the map.
      $scope.$parent.$broadcast('nwMetersChanged', $filter('filterMeterByCategories')(meters, getCategoriesChecked()));
    }

    /**
     * Select a category forcing reload of the state, used after query search without reloading.
     *
     * @param categoryId
     */
    $scope.select = function(categoryId) {
      $state.forceGo('dashboard.withAccount.categories', {categoryId: categoryId});
    }

    /**
     * Return an array of the category ids, checeked.
     *
     * @returns {Array}
     */
    function getCategoriesChecked() {
      var filter = [];

      // Return filter object.
      angular.forEach($scope.categoriesChecked, function(categoryChecked, index) {
        if (!categoryChecked) {
          this.push(index);
        }
      }, filter);

      return filter;
    }

    /**
     * Set the selected category, to keep in other states.
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
