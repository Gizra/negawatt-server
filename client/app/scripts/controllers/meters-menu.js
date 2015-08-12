'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller: MetersMenuCtrl
 */
angular.module('negawattClientApp')
  .controller('MetersMenuCtrl', function ($scope, $state, $stateParams, $filter, Category, Meter, Site, FilterFactory, categories, meters, sites) {

    var vm = this;

    // Selected tab in the categories selector.
    $scope.tab = 'sites';

    $scope.categories = categories;
    $scope.meters = meters.listAll;
    $scope.sites = sites.listAll;
    $scope.siteCategoriesTree = categories.tree;

    // Build meterCategoriesTree.
    $scope.meterCategoriesTree = [
      {
        id: 2,
        label: 'מונה',
        categories: [
          {
            id: 5,
            label: 'מונה ראשי',
            meters: [11, 21]
          },
          {
            id: 1,
            label: 'צ׳ילר',
            meters: [13, 12]
          }
        ]
      }
    ];

    // Reload the categories when new sites/meters are added (new page arrives).
    vm.reloadCategories = function(accountId) {
      // Update categories tree with number of sites.
      Category.get(accountId)
        .then(function(categories) {
          // Update 'categories' object resolved by ui-router.
          $state.setGlobal('categories', categories);
          $scope.categories = categories;
        });
    };

    // Reload the categories when new sites are added (new sites page arrived).
    $scope.$on('nwSitesChanged', function(event, meters) {
      // Update categories tree with number of sites.
      vm.reloadCategories($stateParams.accountId);
    });

    // Reload the categories when new meters are added (new meters page arrived).
    $scope.$on('nwMetersChanged', function(event, meters) {
      // Update categories tree with number of sites.
      vm.reloadCategories($stateParams.accountId);
    });

  });
