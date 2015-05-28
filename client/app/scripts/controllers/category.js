'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller: CategoryCtrl
 * @description
 * # CategoryCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('CategoryCtrl', function ($scope, $state, $stateParams, $filter, Category, Meter, FilterFactory, categories, meters) {

    // Define property in the parent scope, permit to be accesable
    // by scope methods of the controller.

    $scope.categories = categories;
    $scope.accountId = $stateParams.accountId;
    $scope.chartFreq = $stateParams.chartFreq;

    // Activate filter of meters only if we are in the principal state.
    $scope.filterMeters = FilterFactory.showCategoryFilters();

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
    $scope.toggleMetersByCategory = function(category) {
      // Set category filters.
      var filter = {};
      filter[category.id] = category.checked;
      FilterFactory.set('categorized', filter);

      // Update meters on the map, this also update the number of meters on the Category menu.
      $scope.$parent.$broadcast('nwMetersChanged', {
        list: FilterFactory.byCategoryFilters(meters)
      });
    };

    /**
     * Select a category forcing reload of the state, used after query search without reloading.
     *
     * @param categoryId
     */
    $scope.select = function(categoryId) {
      FilterFactory.clearMeterSelection();
      $state.forceGo('dashboard.withAccount.categories', {categoryId: categoryId, chartNextPeriod: undefined, chartPreviousPeriod: undefined});
    };

    // Reload the categories when added new meters to the map.
    $scope.$on('nwMetersChanged', function(event, meters) {
      // Update categories tree with number of meters.

      Category.get($stateParams.accountId)
        .then(function(categories) {
          // Update 'categories' object resolved by ui-router.
          $state.setGlobal('categories', categories);
          $scope.categories = categories;
        });
    });

    /**
     * Set the selected category, to keep in other states.
     *
     * @param id int
     *   The Category ID.
     */
    function setSelectedCategory(id) {
      FilterFactory.set('category', id);
    }

    if ($stateParams.categoryId) {
      setSelectedCategory($stateParams.categoryId);
    }

  });
