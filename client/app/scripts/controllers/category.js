'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller: CategoryCtrl
 * @description
 * # CategoryCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('CategoryCtrl', function ($scope, $state, $stateParams, $filter, Category, Meter, MeterFilter, categories, meters) {

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
     * @param id
     *  The category id of the element selected.
     */
    $scope.toggleMetersByCategory = function(id) {
      // Set category filters.
      var filter = {};
      filter[id] = $scope.categoriesChecked[id].checked;
      MeterFilter.set('categorized', filter);
      // Refresh categories tre object.
      $scope.categories.tree = MeterFilter.refreshCategoriesFilters($scope.categories.tree);
      // Update meters on the map.
      $scope.$parent.$broadcast('nwMetersChanged', {
        list: $filter('filterMeterByCategories')(meters.list, getCategoriesChecked())
      });
    };

    /**
     * Select a category forcing reload of the state, used after query search without reloading.
     *
     * @param categoryId
     */
    $scope.select = function(categoryId) {
      MeterFilter.clearMeterSelection();
      $state.forceGo('dashboard.withAccount.categories', {categoryId: categoryId, chartNextPeriod: undefined, chartPreviousPeriod: undefined});
    };

    // Reload the categories when added new meters to the map.
    $scope.$on('nwMetersChanged', function(event, meters) {
      Category.get($stateParams.accountId)
        .then(function(categories) {
          $state.setGlobal('categories', categories);
          $scope.categories = categories;
        });
    });

    /**
     * Return an array of the category ids, checked.
     *
     * @returns {Array}
     */
    function getCategoriesChecked() {
      var filter = [];

      // Return filter object.
      angular.forEach($scope.categoriesChecked, function(category, index) {
        if (!category.checked) {
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
      MeterFilter.set('category', id);
    }

    if ($stateParams.categoryId) {
      setSelectedCategory($stateParams.categoryId);
    }

  });
