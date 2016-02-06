'use strict';

angular.module('negawattClientApp')
  .service('ApplicationState', function ApplicationState($q, $rootScope, $state, $stateParams, ChartOptions, ChartUsagePeriod, Electricity, Profile, SensorData, SensorTree, SensorType) {

    var appState = this;

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
     * Sensor selection ids. A replication of $stateParams.sensor.
     */
    this.sensor = $stateParams.sensor;

    /**
     * Save last used filters in get calls.
     *
     * Filters includes sel and ids, a replication of $stateParams sel and ids.
     */
    this.filters = {};

    /**
     * The currently used time-frame.
     */
    this.period = ChartUsagePeriod;

    /**
     * Configuration information for charts.
     */
    this.config = {};

    /**
     * The detailed chart (chart wrapper) directive, will receive
     * notifications on any change in data or options.
     */
    this.detailedChart = null;

    /**
     * The usage chart directive, will receive notifications on
     * the sensor-tree.
     */
    this.mainChart = null;

    /**
     * The usage chart directive, will receive notifications on
     * the sensor-tree.
     */
    this.pieChart = null;

    /**
     * The meters-menu controller, will receive notifications on any
     * change in data or options.
     */
    this.metersMenu = null;

    /**
     * Register detailed-chart directive for later communication.
     */
    this.registerDetailedChart = function(chart) {
      this.detailedChart = chart;
    };

    /**
     * Register detailed-chart directive for later communication.
     */
    this.registerMainChart = function(chart) {
      this.mainChart = chart;
      $q.all([SensorTree.get($stateParams.accountId), SensorType.get($stateParams.accountId)])
        .then(function(treeAndType) {
          var tree = treeAndType[0];
          var type = treeAndType[1];
          chart.takeSensorTreeAndType(tree, type);
        })
    };

    /**
     * Register detailed-chart directive for later communication.
     */
    this.registerPieChart = function(chart) {
      this.pieChart = chart;
      SensorTree.get($stateParams.accountId)
        .then(function (tree) {
          chart.takeSensorTree(tree);
        })
    };

    /**
     * Register meters-menu controller for later communication.
     */
    this.registerMetersMenu = function(menu) {
      this.metersMenu = menu;
    };

    // Wait for charts to register before calling init()
    var intervalId = setInterval(function() {
      // Wait of all the chart objects to register.
      if (appState.detailedChart && appState.mainChart && appState.pieChart) {
        clearInterval(intervalId);
        appState.init();
      }
    }, 500);

    /**
     * Handle URL/State change.
     *
     * When changing URL manually, or login after logout, has to call
     * init() again to reset app-state.
     */
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      if (fromParams.accountId != toParams.accountId) {
        appState.init();
      }
    });

    /**
     * Initialize application state.
     */
    this.init = function() {
      // Tell all charts to go to 'loading' state.
      $rootScope.$broadcast('nwChartBeginLoading');

      // Prepare filters to get electricity.
      this.filters = {
        accountId: $stateParams.accountId,
        sel: $stateParams.sel,
        ids: $stateParams.ids,
        sensor: $stateParams.sensor
      };

      // Define chart configuration.
      this.config = {
        chartFreq: $stateParams.chartFreq,
        compareWith: $stateParams.sensor
      };

      // If period is given in the URL, hard set period's reference-date
      // to the beginning of the interval. It will be checked for validity
      // after setting the frequency.
      if ($stateParams.chartPreviousPeriod) {
        this.period.getChartPeriod().referenceDate = $stateParams.chartPreviousPeriod;
      }

      // Update chart title in detailed-chart
      this.updateChartTitle();

      // Simulate a frequency change, that will handle loading the electricity
      // first with no data to adjust the max and min time-frame, and the load
      // the electricity data itself.
      this.frequencyChanged($stateParams.chartFreq);

      return this;
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
      var ids = $stateParams.ids,
        sel = $stateParams.sel,
        objectsSelected = true;

      if (!object.selected) {
        // object unselected, remove it from state-params.
        var objects = ids.split(',');
        // object.id is a number, objects is an array of strings. Convert object.id to string.
        objects.splice(objects.indexOf('' + object.id), 1);
        ids = objects.join();

        // Unset sel if no object is selected
        if (ids == '') {
          sel = undefined;
          objectsSelected = false;
        }
      }
      else {
        // object selected.
        // Set selected object to state-params.
        sel = name;

        // Select the object.
        var objects = ids ? ids.split(',') : [];
        objects.push(object.id);
        ids = objects.join();
      }

      // Refresh $state with new params.
      this.updateSelection(sel, ids);

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
        var meters = $stateParams.sensor ? $stateParams.sensor.split(',') : [];
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

      this.filters.sel = sel;
      this.filters.ids = ids;

      // Refresh $state with new params.
      $state.refreshUrlWith($stateParams);

      if (refreshCheckMarks) {
        this.metersMenu.checkSelectedRows($stateParams);
      }

      // Update chart title in detailed-chart
      this.updateChartTitle();

      // Get time-frame limits for new selected-objects and then
      // get electricity and sensor data from the server.
      this.updatePeriodLimitsAndGetElectricity();
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

      this.filters.sensor = sensor;

      // Refresh $state with new params.
      $state.refreshUrlWith($stateParams);

      // Get time-frame limits for new selected-objects and then
      // get electricity and sensor data from the server.
      this.updatePeriodLimitsAndGetElectricity();
    };

    /**
     * Update the current selected objects, both in application-state and
     * in $stateParams.
     *
     * @param newFrequency integer
     *  The new frequency.
     */
    this.frequencyChanged = function(newFrequency, newReferenceDate) {
      this.period.changeFrequency(newFrequency);

      this.filters.chartFreq = newFrequency;
      $stateParams.chartFreq = newFrequency;

      // Refresh $state with new params.
      $state.refreshUrlWith($stateParams);

      if (newReferenceDate) {
        this.period.setReferenceDate(newReferenceDate)
      }

      // Get time-frame limits for new frequency and then
      // get electricity from the server.
      this.updatePeriodLimitsAndGetElectricity();
    };

    /**
     * Update the current selected objects, both in application-state and
     * in $stateParams.
     */
    this.updatePeriodLimitsAndGetElectricity = function() {
      // Get electricity, for the first time with no data, only summary
      // with time-frame upper and lower limits.
      this.filters.noData = true;
      this.getElectricityAndSensors(this.filters)
        .then(function(electricityAndData) {
          var electricity = electricityAndData[0];
          var sensorData = electricityAndData[1];

          // Got the summary, set time-frame limits from electricity, if there's one,
          // and from sensor-data if there's no electricity data.
          var params = {
            min: electricity ? electricity.summary.timestamp.min : sensorData.summary.timestamp.min,
            max: electricity ? electricity.summary.timestamp.max : sensorData.summary.timestamp.max
          };
          appState.period.config(params);

          // Update stateParams with new limits.
          $stateParams.chartNextPeriod = appState.period.getChartPeriod().next;
          $stateParams.chartPreviousPeriod = appState.period.getChartPeriod().previous;
          $state.refreshUrlWith($stateParams);

          // Update filters with new limits.
          appState.filters.chartPreviousPeriod = appState.period.getChartPeriod().previous;
          appState.filters.chartNextPeriod = appState.period.getChartPeriod().next;

          // Update date-range text near the chart title.
          var chartDateRange = appState.period.formatDateRange(appState.period.getChartPeriod().previous * 1000, appState.period.getChartPeriod().next * 1000);

          // ReferenceDate is used to communicate with the date selector,
          // update date-selector with current reference date.
          // Note that datepicker's referenceDate is in milliseconds.
          var chartReferenceDate = appState.period.getChartPeriod().referenceDate * 1000;

          // Update the chart with new period.
          appState.detailedChart.setup(chartDateRange, chartReferenceDate);

          // Now really get the electricity and sensor data.
          appState.filters.noData = false;
          appState.getElectricityAndSensors(appState.filters);
        });
    };

    /**
     * Update the current selected objects, both in application-state and
     * in $stateParams.
     *
     * @param periodDirection
     *  The direction of the change (forward or backward).
     */
    this.periodChanged = function(periodDirection) {
      this.period.changePeriod(periodDirection);

      // Update filters with new limits.
      this.filters.chartPreviousPeriod = this.period.getChartPeriod().previous;
      this.filters.chartNextPeriod = this.period.getChartPeriod().next;

      // Update stateParams with new period.
      $stateParams.chartNextPeriod = this.period.getChartPeriod().next;
      $stateParams.chartPreviousPeriod = this.period.getChartPeriod().previous;
      $state.refreshUrlWith($stateParams);

      // Update date-range text near the chart title.
      var chartDateRange = this.period.formatDateRange(this.period.getChartPeriod().previous * 1000, this.period.getChartPeriod().next * 1000);

      // ReferenceDate is used to communicate with the date selector,
      // update date-selector with current reference date.
      // Note that datepicker's referenceDate is in milliseconds.
      var chartReferenceDate = this.period.getChartPeriod().referenceDate * 1000;

      // Update the chart with new period.
      appState.detailedChart.setup(chartDateRange, chartReferenceDate);

      // Get the electricity and sensor data.
      appState.getElectricityAndSensors(this.filters);
    };

    /**
     * Prepare filters for API call.
     *
     * Convert the filters from query-string format to API filter format.
     *
     * @param params array
     *  Parameter object regularly coming from the query string.
     * @param whatFor string
     *  Either 'forElectricity' or 'forSensor'.
     *
     * @return object
     *   The filters as HTTP call parameters.
     */
    this.prepareFilters = function (params, whatFor) {
      // Prepare electricity filter in querystring format.
      var filters = {
        'filter[meter_account]': params.accountId,
        'filter[frequency]': params.chartFreq
      };

      // Check noData option.
      if (params.noData) {
        // No need for timestamp filters
        filters['nodata'] = 1;
      }

      // Add filters by period.
      angular.extend(filters, {
        'filter[timestamp][operator]': 'BETWEEN',
        'filter[timestamp][value][0]': params.chartPreviousPeriod || '',
        'filter[timestamp][value][1]': params.chartNextPeriod || ''
      });

      if (whatFor == 'forElectricity') {
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
              filters['filter[' + params.sel + '][value][' + i++ + ']'] = id;
            });
          }
          else {
            // A single ID was given, Output in the format:
            // filter[selector] = val
            filters['filter[' + params.sel + ']'] = params.ids;
          }
        }
      }
      else {
        // Preparing filters for sensor.
        filters['filter[sensor]'] = params.sensor;

        var idsArray = params.sensor ? params.sensor.split(',') : [];
        if (idsArray && idsArray.length > 1) {
          // If multiple IDs are given, output in the format:
          // filter[selector][operator] = IN
          // filter[selector][value][0] = val-1
          // filter[selector][value][1] = val-2
          // ... etc.
          filters['filter[sensor][operator]'] = 'IN';
          var i = 0;
          angular.forEach(idsArray, function (id) {
            filters['filter[sensor][value][' + i++ + ']'] = id;
          });
        }
        else {
          // A single ID was given, Output in the format:
          // filter[selector] = val
          filters['filter[sensor]'] = params.sensor;
        }
      }

      return filters;
    };

    /**
     * Get current electricity data.
     *
     * Fetch electricity data acccording to 'params' filtering.
     *
     * @param params
     *  Parameter object regularly coming from the query string.
     */
    this.getElectricityAndSensors = function (params) {
      var deferred = $q.defer();

      // Prepare electricity filter in querystring format.
      var electricityFilters = this.prepareFilters(params, 'forElectricity');
      var sensorFilters = this.prepareFilters(params);

      // Fetch the electricity data.
      $q.all([Electricity.get(electricityFilters), params.sensor ? SensorData.get(sensorFilters) : null])
        .then(function(electricityAndData) {
          var electricity = electricityAndData[0];
          var sensorData = electricityAndData[1];

          // Draw the main and pie charts,
          // but only if there was no 'noData' flag in params.
          if (!params.noData) {
            appState.mainChart.takeData(electricity.data, electricity.summary, sensorData ? sensorData.data : []);
            appState.pieChart.renderChart(electricity.summary);
          }
          deferred.resolve(electricityAndData);
        });

      // If there's a second chart (with different period)...
      //  Change filters here to new period.
      //  Fetch new data.
      //  Send it to the second chart.
      return deferred.promise;
    };

    /**
     * Figure out chart title, and broadcast update event.
     */
    this.updateChartTitle = function() {
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

        SensorTree.get($stateParams.accountId)
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
    };

    /**
     * Handler for electricity lazy-load.
     *
     * Take the new data, the chart watches 'electricity' and
     * will get updated with the new data.
     */
    $rootScope.$on("nwElectricityChanged", function(event, electricity) {
      if (electricity.pageNumber > 1) {
        // Pass the data only if on second page and on. The first page is
        // always handled, so prevent double-rendering of the charts.
        appState.mainChart.takeData(electricity.data, electricity.summary, null);
      }
    });

    /**
     * Handler for sensor-data lazy-load.
     *
     * Take the new data, the chart watches 'sensorData' and
     * will get updated with the new data.
     */
    $rootScope.$on("nwSensorDataChanged", function(event, sensorData) {
      if (sensorData.pageNumber > 1) {
        // Pass the data only if on second page and on. The first page is
        // always handled, so prevent double-rendering of the charts.
        appState.mainChart.takeData(null, null, sensorData.data);
      }
    });

  });
