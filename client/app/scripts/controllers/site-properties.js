'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller:SitePropertyCtrl
 * @description
 * # SitePropertyCtrl
 * Controller of the negawattClientApp
 */
angular.module('negawattClientApp')
  .controller('SitePropertyCtrl', function SitePropertyCtrl($scope, $rootScope, Site) {
    var extend = angular.extend;
    var vm = this;

    extend(vm, {
      change: change,
      selectMeter: selectMeter
    });

    /**
     * Update chart when select temperature property.
     */
    function change() {
      Site.properties.compareWith = this.compareWith;

      redrawChart(Site.properties);
    }

    /**
     * Meter selection.
     */
    function selectMeter() {
      Site.properties.meter = this.meter;

      redrawChart(Site.properties);
    }

    /**
     * Trigger event to redraw chart, with new properties.
     *
     * @param siteProperties
     */
    function redrawChart(siteProperties) {
      $rootScope.$broadcast('sitePropertiesCtrlChange', siteProperties);
    }
  });
