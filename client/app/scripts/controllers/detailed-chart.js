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
  .controller('DetailedChartCtrl', function DetailedChartCtrl($scope, $state, $stateParams, $filter, Electricity, Chart, ChartUsagePeriod, FilterFactory, meters, filters, ChartElectricityUsage, siteCategories, sites, profile) {
    var detailedChartCtrl = this;

    // Start with no compare chart.
    detailedChartCtrl.hasExtraChart = false;

    detailedChartCtrl.account = $stateParams.accountId;
    var compareCollection;
    var options;

    $scope.siteCategories = siteCategories;
    $scope.sites = sites;
    $scope.meters = meters;

    // Get the parameters chart frecuency.
    if (angular.isDefined($stateParams.chartFreq)) {
      Chart.setActiveFrequency($stateParams.chartFreq);
    }

    // Get from parameters information of the selected marker.
    if (angular.isDefined($stateParams.markerId)) {
      // Share meter selected.
      $scope.meterSelected = meters.list[$stateParams.markerId];
    }

    // Set the current selection label.
    if ($stateParams.markerId) {
      // Set marker label.
      this.title = meters.list[$stateParams.markerId] ? meters.list[$stateParams.markerId].label : null;
    }
    else if ($stateParams.categoryId) {
      // When no marker is selected fetch category label.
      this.title = siteCategories.list[$stateParams.categoryId] ? siteCategories.list[$stateParams.categoryId].label : null;
    }
    else {
      // Otherwise display account label.
      // Find the current selected account in the user's accounts.
      angular.forEach(profile.account, function(account) {
        if (account.id == $stateParams.accountId) {
          this.title = account.label;
          return;
        }
      }, detailedChartCtrl);
    }

    $scope.$on('sitePropertiesCtrlChange', function (event, siteProperties) {
      detailedChartCtrl.siteProperties = (!siteProperties) ? undefined : siteProperties;
    });
  });
