'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller: MetersMenuCtrl
 */
angular.module('negawattClientApp')
  .controller('MetersMenuCtrl', function ($scope, $state, $stateParams, $filter, SiteCategory, siteCategories, MeterCategory, meterCategories, Meter, meters, PropertyMeter, propertyMeters, Site, sites, FilterFactory) {

    var vm = this;

    // Selected tab in the categories selector.
    $scope.tab = 'sites';

    $scope.meters = meters.listAll;
    $scope.propertyMeters = propertyMeters.listAll;
    $scope.siteCategoriesTree = siteCategories.tree;
    $scope.meterCategoriesTree = meterCategories.tree;

    // Reload the categories when new sites/meters are added (new page arrives).
    vm.reloadCategories = function(accountId) {
      // Update categories tree with number of sites.
      SiteCategory.get(accountId)
        .then(function(siteCategories) {
          // Update 'categories' object resolved by ui-router.
          $state.setGlobal('siteCategories', siteCategories);
          $scope.siteCategories = siteCategories;
        });

      MeterCategory.get(accountId)
        .then(function(meterCategories) {
          // Update 'categories' object resolved by ui-router.
          $state.setGlobal('meterCategories', meterCategories);
          $scope.meterCategories = meterCategories;
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
