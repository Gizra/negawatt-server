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
     * Sensor selection ids. A replication of $stateParams.sensor.
     */
    this.sensor = $stateParams.sensor;

    /**
     * The detailed chart directive, will receive notifications on any
     * change in data or options.
     */
    this.detailedChart = null;

    /**
     * The meters-menu controller, will receive notifications on any
     * change in data or options.
     */
    this.metersMenu = null;

    /**
     * A function to register during the 'resolve' stage.
     */
    this.init = function() {
      return this;
    };

    /**
     * Register detailed-chart directive for later communication.
     */
    this.registerDetailedChart = function(chart) {
      this.detailedChart = chart;
    };

    /**
     * Register meters-menu controller for later communication.
     */
    this.registerMetersMenu = function(menu) {
      this.metersMenu = menu;
    };

    /**
     * Add or remove an object form the active-electricity-filter after clicking
     * the checkbox in the categories/meters tree.
     *
     * @param object
     *   The meter object.
     * @param name
     *   The name of the object, e.g. 'meter', 'site', ...
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
     * Add or remove an object form the active-electricity-filter after clicking
     * the checkbox in the categories/meters tree.
     *
     * @param meter
     *   The meter object.
     *
     * @return boolean
     *   True if objects are selected, false if the last object is unselected.
     */
    this.addSensorSelected = function(meter) {
      var metersSelected = true;

      if (!meter.selected) {
        // meter unselected, remove it from state-params.
        var meters = $stateParams.sensor.split(',');
        // object.id is a number, objects is an array of strings. Convert object.id to string.
        meters.splice(meters.indexOf('' + meter.id), 1);
        $stateParams.sensor = meters.join();

        // Unset sel if no object is selected
        if ($stateParams.sensor == '') {
          metersSelected = false;
        }
      }
      else {
        // Select the object.
        var meters = $stateParams.climate ? $stateParams.climate.split(',') : [];
        meters.push(meter.id);
        $stateParams.sensor = meters.join();
      }

      // Refresh $state with new params.
      this.updateSensorSelection($stateParams.sensor);

      return metersSelected;
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
     * @param refreshCheckMarks boolean
     *  True if has to re-mark the check marks in the sensors-menu.
     */
    this.updateSelection = function(sel, ids, refreshCheckMarks) {
      $stateParams.sel = sel;
      $stateParams.ids = ids;

      this.sel = sel;
      this.ids = ids;

      // Refresh $state with new params.
      $state.refreshUrlWith($stateParams);

      if (refreshCheckMarks) {
        this.metersMenu.checkSelectedRows($stateParams);
      }

      // Get a new set of electricity data, according to the new
      // selected objects.
      this.getElectricity($stateParams);

      // FIXME: Consider replacing this with a direct call to selectionChanged()
      $rootScope.$broadcast('selectionChanged');
    };

    /**
     * Update the current selected sensors, both in application-state and
     * in $stateParams.
     *
     * @param sensor
     *  The ids of selected sensor(s) as a comma separated list.
     *  To clear the selection, 'sensor' should be null.
     */
    this.updateSensorSelection = function(sensor) {
      $stateParams.sensor = sensor;

      this.sensor = sensor;

      // Refresh $state with new params.
      $state.refreshUrlWith($stateParams);

      // Get a new set of sensor data, according to the new
      // selected objects.
      this.getSensorData($stateParams);

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
