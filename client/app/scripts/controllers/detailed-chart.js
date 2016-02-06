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
  .controller('DetailedChartCtrl', function DetailedChartCtrl() {
    var detailedChartCtrl = this;

    // Start with no compare chart.
    detailedChartCtrl.hasExtraChart = false;
  });
