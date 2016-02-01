'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller: MetersMenuCtrl
 */
angular.module('negawattClientApp')
  .controller('MetersMenuCtrl', function ($scope, $rootScope ,$stateParams, meterCategories, sensorTree, sensorType, ApplicationState) {

    // Selected tab in the categories selector.
    $scope.tab = 'sites';

    // Expose some data to the scope.
    $scope.sensorTree = sensorTree.tree;
    $scope.sensorCollection = sensorTree.collection;
    $scope.meterCategories = meterCategories.collection;
    $scope.sensorType = sensorType;

    // Expose some functions.
    this.checkSelectedRows = checkSelectedRows;

    // Check the checkboxes in the selected rows.
    checkSelectedRows($stateParams);

    // Register in application-state for later communication.
    ApplicationState.registerMetersMenu(this);

    /**
     * Uncheck all checkboxes.
     */
    this.clearAll = function () {
      // Update stateParam.
      ApplicationState.updateSelection(undefined, undefined);
      ApplicationState.updateSensorSelection(undefined);

      // Clear all checkboxes in the menu.
      checkSelectedRows($stateParams);

      // Reset checkbox disabling
      $scope.disableSites = false;
      $scope.disableMeters = false;
      $scope.disableCategories = false;
    };

    /**
     * Handler for meter selection.
     *
     * @param meter
     *  Meter object.
     */
    $scope.selectMeter = function(meter) {
      // Add/remove meter from selected list.
      var selected = ApplicationState.addObjectSelected(meter, 'meter');

      // Disable sites and categories if one or more meters are selected.
      $scope.disableSites = selected;
      $scope.disableCategories = selected;
    };

    /**
     * Handler for sensor selection.
     *
     * @param sensor
     *  Sensor object.
     */
    $scope.selectSensor = function(sensor) {
      // Add/remove meter from selected list.
      var selected = ApplicationState.addSensorSelected(sensor);

      // Disable sites and categories if one or more meters are selected.
      $scope.disableSites = selected;
      $scope.disableCategories = selected;
    };

    /**
     * Handler for category selection.
     *
     * @param category
     *  Category or Site object.
     */
    $scope.selectCategory = function(category) {
      // Add/remove meter from selected list.
      var selected = ApplicationState.addObjectSelected(category, 'site_category');

      // Disable sites and meters if one or more categories are selected.
      $scope.disableSites = selected;
      $scope.disableMeters = selected;
    };

    /**
     * Handler for site selection.
     *
     * @param site
     *  Site object.
     */
    $scope.selectSite = function(site) {
      // Add/remove site from selected list.
      var selected = ApplicationState.addObjectSelected(site, 'meter_site');

      // Disable meters and categories if one or more sites are selected.
      $scope.disableMeters = selected;
      $scope.disableCategories = selected;
    };

    /**
     * Check the check-boxes of the rows of entities that are marked as selected
     * in the stateParams.
     *
     * @param params
     *  Selection parameter, like in $stateParams.
     *  DON'T use $stateParams here. Sometimes it's not up to date.
     */
    function checkSelectedRows(params) {
      // Start by clearing all previous check-marks (if were any...).
      angular.forEach($scope.sensorCollection, function (item) {
        item.selected = false;
      });

      // Check boxes of meters that are selected in state-params.
      if (params.ids) {
        var selectedObjects = params.ids.split(',');
        switch (params.sel) {
          case 'meter':
            // Check meters that are selected in state-params.
            angular.forEach($scope.sensorCollection, function (item) {
              item.selected = (item.type == 'meter' && selectedObjects.indexOf(item.id) != -1);
            });
            // Disable sites and categories.
            $scope.disableMeters = false;
            $scope.disableSites = true;
            $scope.disableCategories = true;
            break;

          case 'meter_site':
            // Check sites that are selected in state-params.
            angular.forEach($scope.sensorCollection, function (item) {
              item.selected = (item.type == 'meter_site' && selectedObjects.indexOf(item.id) != -1);
            });
            // Disable meters and categories.
            $scope.disableMeters = true;
            $scope.disableSites = false;
            $scope.disableCategories = true;
            break;

          case 'site_category':
            // Check site categories that are selected in state-params.
            angular.forEach($scope.sensorCollection, function (item) {
              item.selected = (item.type == 'site_category' && selectedObjects.indexOf(item.id) != -1);
            });
            // Disable sites and meters.
            $scope.disableMeters = true;
            $scope.disableSites = true;
            $scope.disableCategories = false;
            break;
        }
      }

      // Check boxes of sensors that are selected in state-params.
      if (params.sensor) {
        var selectedObjects = params.sensor.split(',');
        // Check sensors that are selected in state-params.
        angular.forEach(selectedObjects, function (itemId) {
          if ($scope.sensorCollection['r' + itemId]) {
            $scope.sensorCollection['r' + itemId].selected = true;
          }
        });
      }
    }
  });
