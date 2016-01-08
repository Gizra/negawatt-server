'use strict';

angular.module('negawattClientApp')
  .service('ApplicationState', function ApplicationState($rootScope, $state, $stateParams, Electricity, Profile, SensorTree) {

    var applicationState = this;

    /**
     * Return the $stateParams
     *
     * This necesary if need the new $stateParams value and still $location
     * do not trigger url refresh.
     *
     * @type {$stateParams|*}
     */
    this.stateParams = $stateParams;

    /**
     * Selection type. A replication of $stateParams.sel.
     */
    this.sel = $stateParams.sel;

    /**
     * Selection ids. A replication of $stateParams.ids.
     */
    this.ids = $stateParams.ids;

    /**
     * The detailed chart object, will receive notifications on any
     * change in data or options.
     */
    this.detailedChart = null;

    /**
     * A function to register during the 'resolve' stage.
     */
    this.init = function() {
      return this;
    };

    /**
     * Register detailed-chart object for later communication.
     */
    this.registerDetailedChart = function(chart) {
      this.detailedChart = chart;
    };

    /**
     * Add or remove an object form the active-electricity-filter after clicking
     * the checkbox in the categories/meters tree.
     *
     * @param object
     *   The meter object.
     * @param name
     *   The name of the object.
     *
     * @return boolean
     *   True if objects are selected, false if the last object is unselected.
     */
    this.addObjectSelected = function(object, name) {
      var objectsSelected = true;

      if (!object.selected) {
        // object unselected, remove it from state-params.
        var objects = $stateParams.ids.split(',');
        // object.id is a number, objects is an array of strings. Convert object.id to string.
        objects.splice(objects.indexOf('' + object.id), 1);
        $stateParams.ids = objects.join();

        // Unset sel if no object is selected
        if ($stateParams.ids == '') {
          $stateParams.sel = undefined;
          objectsSelected = false;
        }
      }
      else {
        // object selected.
        // Set selected object to state-params.
        $stateParams.sel = name;

        // Select the object.
        var objects = $stateParams.ids ? $stateParams.ids.split(',') : [];
        objects.push(object.id);
        $stateParams.ids = objects.join();
      }

      // Refresh $state with new params.
      this.updateSelection($stateParams.sel, $stateParams.ids);

      return objectsSelected;
    };

    /**
     * Update the current selected objects, both in application-state and
     * in $stateParams.
     *
     * @param sel
     *  The type of selected object(s): 'meter', 'site', ...
     * @param ids
     *  The ids of selected object(s) as a comma separated list.
     *  To clear the selection, both sel and ids should be null.
     */
    this.updateSelection = function(sel, ids) {
      $stateParams.sel = sel;
      $stateParams.ids = ids;

      this.sel = sel;
      this.ids = ids;

      // Refresh $state with new params.
      $state.refreshUrlWith($stateParams);

      // Get a new set of electricity data, according to the new
      // selected objects.
      this.getElectricity($stateParams);

      // FIXME: Consider replacing this with a direct call to selectionChanged()
      $rootScope.$broadcast('selectionChanged');
    };

    /**
     * Get current electricity data.
     *
     * Save of the params as current electricity filter and fetch
     * the updated electricity data.
     *
     * @param params
     *  Parameter object regularly coming from the query string.
     */
    this.getElectricity = function (params) {
      // Prepare electricity filter in querystring format.
      var filters = {
        'filter[meter_account]': params.accountId,
        'filter[frequency]': params.chartFreq
      };

      // Check noData option.
      if (params.noData) {
        // No need for timestamp filters
        filters['nodata'] = 1;
        //FilterFactory.set('electricity-nodata', true);
      }

      // Add filters by period.
      angular.extend(filters, {
        'filter[timestamp][operator]': 'BETWEEN',
        'filter[timestamp][value][0]': params.chartPreviousPeriod || '',
        'filter[timestamp][value][1]': params.chartNextPeriod || ''
      });
      // Set filter electricity.nodata
      //FilterFactory.set('electricity-nodata', false);

      // Add filters for selected entities.
      var idsArray = params.ids ? params.ids.split(',') : [];
      if (params.sel) {
        if (idsArray && idsArray.length > 1) {
          // If multiple IDs are given, output in the format:
          // filter[selector][operator] = IN
          // filter[selector][value][0] = val-1
          // filter[selector][value][1] = val-2
          // ... etc.
          filters['filter[' + params.sel + '][operator]'] = 'IN';
          var i = 0;
          angular.forEach(idsArray, function (id) {
            filters['filter[' + params.sel + '][value][' + i++ +']'] = id;
          });
        }
        else {
          // A single ID was given, Output in the format:
          // filter[selector] = val
          filters['filter[' + params.sel + ']'] = params.ids;
        }
      }

      // Fetch the electricity data.
      Electricity.get2(filters)
        .then(function(electricity) {
          // Pass the data to the detailed-chart for update.
          applicationState.detailedChart.takeElectricity(electricity);
        });

      // If there's a second chart (with different period)...
      //  Change filters here to new period.
      //  Fetch new data.
      //  Send it to the second chart.
    };


    /**
     * Configure the initial values of a period, according the filters and data set.
     *
     * @param limits
     */
    this.periodChanged = function() {
    };

    /**
     * Configure the initial values of a period, according the filters and data set.
     *
     * @param limits
     */
    this.frequencyChanged = function() {
    };

    /**
     * Handle selection change.
     */
    $rootScope.$on('selectionChanged', function () {
      // Set the current selection label.
      var title = '';
      if ($stateParams.sel) {
        // Set marker label.
        var selectedObjects = $stateParams.ids.split(',');
        var classLetter = '';
        switch ($stateParams.sel) {
          case 'meter':
            classLetter = 'm';
            break;

          case 'meter_site':
            classLetter = 's';
            break;

          case 'site_category':
            classLetter = 'c';
            break;
        }

        SensorTree.get()
          .then(function(sensorTree) {
            selectedObjects = selectedObjects.map(function (id) {
              return sensorTree.collection[classLetter + id].name;
            });
            title = selectedObjects.join(', ');
            $rootScope.$broadcast('setChartTitleTo', title);
          });
      }
      else {
        // Otherwise display account label.
        // Find the current selected account in the user's accounts.
        Profile.get()
          .then(function(profile) {
            angular.forEach(profile.account, function(account) {
              if (account.id == $stateParams.accountId) {
                title = account.label;
                return;
              }
            });
            $rootScope.$broadcast('setChartTitleTo', title);
          });
      }
    });

  });
