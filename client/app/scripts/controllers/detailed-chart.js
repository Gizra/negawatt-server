'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:DetailedChartCtrl
 * @description
 *  Details chart controller.
 *
 * Controller for the charts section (both usage and pie, probably times two, if compare-chart is on), in chart mode.
 */

angular.module('negawattClientApp')
  .controller('DetailedChartCtrl', function DetailedChartCtrl($scope, $state, $stateParams, $filter, Electricity, Chart, ChartUsagePeriod, FilterFactory, meters, SensorTree, sensorTree, filters, ChartElectricityUsage, siteCategories, sites, profile, ApplicationState) {
    var detailedChartCtrl = this;

    // Start with no compare chart.
    detailedChartCtrl.hasExtraChart = false;

    detailedChartCtrl.account = $stateParams.accountId;

    $scope.siteCategories = siteCategories;
    $scope.sites = sites;
    $scope.meters = meters;

    // Get from parameters information of the selected marker.
    if (angular.isDefined($stateParams.markerId)) {
      // Share meter selected.
      $scope.meterSelected = meters.list[$stateParams.markerId];
    }

    $scope.$on('sitePropertiesCtrlChange', function (event, siteProperties) {
      detailedChartCtrl.siteProperties = (!siteProperties) ? undefined : siteProperties;
    });
  });
