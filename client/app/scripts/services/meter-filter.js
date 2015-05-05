'use strict';

angular.module('negawattClientApp')
  .factory('MeterFilter', function ($filter, $state, $stateParams, Utils) {

    return {
      filters: {},
      /**
       * Filter meters by category.
       *
       * @param meters
       *  The meters colection.
       *
       * @returns {*}
       *  The meters collection filteref by category.
       */
      byCategory: function(meters) {
        meters = Utils.toArray(meters.listAll);

        return Utils.indexById($filter('filter')(meters, function filterByCategory(meter) {
          // Return meters.
          if (!this.filters.category || meter.meter_categories && meter.meter_categories[this.filters.category]) {
            return meter;
          }
        }.bind(this), true));
      },
      /**
       * Return if need it, to show checkboxes to filter meter by categories.
       *
       * @returns {boolean}
       */
      showCategoryFilters: function() {
        var showControls = false;
        if ($state.is('dashboard.withAccount') || $state.is('dashboard.withAccount.markers')) {
          showControls = true;
        }
        return showControls;
      },
      /**
       * Clear the all the filters for the meters and also
       */
      clear: function() {
        this.clearMeterSelection();
        $stateParams.chartNextPeriod = undefined;
        $stateParams.chartPreviousPeriod = undefined;

        this.filters = {};
      },
      /**
       * Return meter saved in the meter filters service.
       *
       * @returns {*|undefined}
       */
      getMeterSelected: function() {
        return this.filters.meterSelected || undefined;
      },
      /**
       * Save in the meter filters service, the meter selected.
       *
       * @param meter
       *  The meter object.
       */
      setMeterSelected: function(meter) {
        this.filters.meterSelected = meter;
      },
      /**
       * Clear the meter selection saved.
       */
      clearMeterSelection: function() {
        if (angular.isDefined(this.filters.meterSelected)) {
          this.filters.meterSelected.unselect();
        }

        //Clear filters.
        this.filters.meterSelected = undefined;
        this.filters.meter = undefined;
      }
    };

  });
