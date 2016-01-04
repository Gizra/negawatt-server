'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller: MetersMenuCtrl
 */
angular.module('negawattClientApp')
  .controller('MetersMenuCtrl', function ($scope, $state, $stateParams, $filter, ChartDetailedService, SiteCategory, siteCategories, MeterCategory, meterCategories, Meter, meters, PropertyMeter, propertyMeters, Site, sites, SensorTree, sensorTree, SensorType, sensorType, FilterFactory) {

    var metersMenuCtrl = this;

    // Selected tab in the categories selector.
    $scope.tab = 'sites';

    $scope.meterCategories = meterCategories.collection;
    $scope.sensorCollection = sensorTree.collection;
    $scope.sensorTree = sensorTree.tree;
    $scope.sensorType = sensorType;

    // Check the checkboxes in the selected rows.
    checkSelectedRows();

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
    $scope.selectMeter = function(meter) {
      // Add/remove meter from selected list.
      var selected = FilterFactory.addObjectSelected(meter, 'meter');
      // Disable sites and categories if one or more meters are selected.
      $scope.disableSites = selected;
      $scope.disableCategories = selected;

      // Reload electricity data to update charts.
      ChartDetailedService.getElectricity();
    };

    /**
     * Handler for meter selection.
     *
     * @param id
     *  Meter's id.
     */
    $scope.selectSensor = function(sensor) {
      // Add/remove meter from selected list.
      var selected = FilterFactory.addSensorSelected(sensor);
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
      // Add/remove meter from selected list.
      var selected = FilterFactory.addObjectSelected(category, 'site_category');
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
    $scope.selectSite = function(site) {
      // Add/remove site from selected list.
      var selected = FilterFactory.addObjectSelected(site, 'meter_site');
      // Disable meters and categories if one or more sites are selected.
      $scope.disableMeters = selected;
      $scope.disableCategories = selected;

      // Reload electricity data to update charts.
      ChartDetailedService.getElectricity();
    };

    /**
     * Reload the categories when new meters are added (new meters page arrived).
     */
    $scope.$on('nwMetersChanged', function() {
      // Update categories tree with number of sites.
      metersMenuCtrl.reloadCategories($stateParams.accountId);
    });

    /**
     * Check the check-boxes of the rows of entities that are marked as selected
     * in the stateParams.
     */
    function checkSelectedRows() {
      // Check boxes of items that are selected in state-params.
      if ($stateParams.ids) {
        var selectedObjects = $stateParams.ids.split(',');
        switch ($stateParams.sel) {
          case 'meter':
            // Check meters that are selected in state-params.
            angular.forEach($scope.sensorCollection, function (item) {
              item.selected = (item.type == 'meter' && selectedObjects.indexOf(item.id) != -1);
            });
            // Disable sites and categories.
            $scope.disableSites = true;
            $scope.disableCategories = true;
            break;

          case 'meter_site':
            // Check sites that are selected in state-params.
            angular.forEach($scope.sensorCollection, function (item) {
              item.selected = (item.type == 'site' && selectedObjects.indexOf(item.id) != -1);
            });
            // Disable meters and categories.
            $scope.disableMeters = true;
            $scope.disableCategories = true;
            break;

          case 'site_category':
            // Check site categories that are selected in state-params.
            angular.forEach($scope.sensorCollection, function (item) {
              item.selected = (item.type == 'category' && selectedObjects.indexOf(item.id) != -1);
            });
            // Disable sites and meters.
            $scope.disableSites = true;
            $scope.disableMeters = true;
            break;
        }
      }

      // Handle property meters.
      if ($stateParams.climate) {
        // Check climate meters that are selected in state-params.
        var selectedMeters = $stateParams.climate.split(',');
        angular.forEach(propertyMeters.listAll, function (meter) {
          meter.selected = (selectedMeters.indexOf(meter.id) != -1);
        });
      }
    }
    
  });
