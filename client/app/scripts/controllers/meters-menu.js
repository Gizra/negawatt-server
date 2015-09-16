'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller: MetersMenuCtrl
 */
angular.module('negawattClientApp')
  .controller('MetersMenuCtrl', function ($scope, $state, $stateParams, $filter, ChartDetailedService, SiteCategory, siteCategories, MeterCategory, meterCategories, Meter, meters, PropertyMeter, propertyMeters, Site, sites, FilterFactory) {

    var metersMenuCtrl = this;

    // Selected tab in the categories selector.
    $scope.tab = 'sites';

    $scope.meters = meters.listAll;
    $scope.propertyMeters = propertyMeters.listAll;
    $scope.siteCategoriesTree = siteCategories.tree;
    $scope.meterCategoriesTree = meterCategories.tree;

    // If there's a selection in the URL, check the checkboxes in the selected rows.
    if ($stateParams.ids) {
      checkSelectedRows();
    }

    // Reload the categories when new sites/meters are added (new page arrives).
    metersMenuCtrl.reloadCategories = function(accountId) {
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

    /**
     * Uncheck all checkboxes.
     */
    metersMenuCtrl.clearAll = function () {
      // Get all check-boxes.
      var checkBoxes = angular.element('.by-site input');

      // Clear selection.
      angular.forEach(checkBoxes, function (item) {
        item.checked = false;
      });

      // Reset checbox disabeling
      $scope.disableSites = false;
      $scope.disableMeters = false;
      $scope.disableCategories = false;

      // Update stateParam.
      FilterFactory.updateSelection(undefined, undefined);

      // Reload electricity data to update charts.
      ChartDetailedService.getElectricity();
    };

    /**
     * Handler for meter selection.
     *
     * @param id
     *  Meter's id.
     */
    $scope.selectMeter = function(id) {
      var meter = $scope.meters[id];
      // Add/remove meter from selected list.
      var selected = FilterFactory.addMeterSelected(meter);
      // Disable sites and categories if one or more meters are selected.
      $scope.disableSites = selected;
      $scope.disableCategories = selected;

      // Reload electricity data to update charts.
      ChartDetailedService.getElectricity();
    };

    /**
     * Handler for category selection.
     *
     * @param category
     *  Category or Site object.
     */
    $scope.selectCategory = function(category) {
      // Check if this is really a category. In the tree, sites are disguised as categories,
      // but marked with isSite field.
      if (category.isSite) {
        selectSite(category);
        return;
      }
      // Add/remove meter from selected list.
      var selected = FilterFactory.addSiteCategorySelected(category);
      // Disable sites and meters if one or more categories are selected.
      $scope.disableSites = selected;
      $scope.disableMeters = selected;

      // Reload electricity data to update charts.
      ChartDetailedService.getElectricity();
    };

    /**
     * Handler for site selection.
     *
     * @param site
     *  Site object.
     */
    function selectSite(site) {
      // Add/remove site from selected list.
      var selected = FilterFactory.addSiteSelected(site);
      // Disable meters and categories if one or more sites are selected.
      $scope.disableMeters = selected;
      $scope.disableCategories = selected;

      // Reload electricity data to update charts.
      ChartDetailedService.getElectricity();
    }

    /**
     * Handler for site selection.
     *
     * @param site
     *  Site object.
     */
    $scope.selectTemperature = function (meter) {
      // Add/remove site from selected list.
      var selected = FilterFactory.addClimateSelected(meter);

      // Reload electricity data to update charts.
      ChartDetailedService.getTemperature(meter);
    }

    // Reload the categories when new sites are added (new sites page arrived).
    $scope.$on('nwSitesChanged', function() {
      // Update categories tree with number of sites.
      metersMenuCtrl.reloadCategories($stateParams.accountId);
    });

    // Reload the categories when new meters are added (new meters page arrived).
    $scope.$on('nwMetersChanged', function() {
      // Update categories tree with number of sites.
      metersMenuCtrl.reloadCategories($stateParams.accountId);
    });

    // Check the check-boxes of the rows of entities that are marked as selected
    // in the stateParams.
    function checkSelectedRows() {
      // Check boxes of items that are selected in state-params.
      var selectedObjects = $stateParams.ids.split(',');
      // Convert strings to integers.
      selectedObjects = selectedObjects.map(function (value) {
        return +value;
      });
      switch ($stateParams.sel) {
        case 'meter':
          // Check meters that are selected in state-params.
          angular.forEach($scope.meters, function (meter) {
            meter.selected = (selectedObjects.indexOf(+meter.id) != -1);
          });
          // Disable sites and categories.
          $scope.disableSites = true;
          $scope.disableCategories = true;
          break;

        case 'meter_site':
          // Check sites that are selected in state-params.
          // Sites are disguised as site-categories, with isSite field = true. But they will not appear in
          // the categories list, only as children of categories.
          angular.forEach(siteCategories.collection, function (category) {
            angular.forEach(category.children, function (object) {
              object.selected = (object.isSite && selectedObjects.indexOf(object.id) != -1);
            });
          });
          // Disable meters and categories.
          $scope.disableMeters = true;
          $scope.disableCategories = true;
          break;

        case 'site_category':
          // Check site categories that are selected in state-params.
          angular.forEach(siteCategories.collection, function (category) {
            category.selected = (selectedObjects.indexOf(category.id) != -1);
          });
          // Disable sites and meters.
          $scope.disableSites = true;
          $scope.disableMeters = true;
          break;
      }
    }
    
  });
