'use strict';

angular.module('negawattClientApp')
  .service('ApplicationState', function ApplicationState($q, $rootScope, $state, $stateParams, ChartOptions, ChartUsagePeriod, Electricity, Profile, SensorData, SensorTree, SensorType, Utils) {

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
     * The markers map.
     */
    this.markersMap = null;

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

    /**
     * Register markers-map controller for later communication.
     */
    this.registerMap = function(map) {
      this.markersMap = map;
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
    $rootScope.$on('$locationChangeSuccess', function(event, newUrl, oldUrl, newState, oldState) {
      // This handler will be called for EVERY URL change. In order to identify
      // 'legitimate' URL change (a one that originated from the application)
      // from 'illegitimate' one (a one that follows manual URL change), compare
      // the appState filters to the URL parameters.

      // Parse URL to it's parameters.
      if ($stateParams.accountId != appState.filters.accountId) {
        // Account change, init appState anew.
        appState.init();
      }
      else if ($stateParams.sel != appState.filters.sel || $stateParams.ids != appState.filters.ids || $stateParams.sensor != appState.filters.sensor) {
        // Meter/sensor selection was changed, re-read data.
        appState.init();
      }
      else if ($stateParams.chartFreq != appState.filters.chartFreq) {
        // Frequency changed.
        appState.init();
      }
      else if ($stateParams.chartNextPeriod != appState.filters.chartNextPeriod || $stateParams.chartPreviousPeriod != appState.filters.chartPreviousPeriod) {
        // Period changed.
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
        sensor: $stateParams.sensor,
        norm: $stateParams.norm
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

      // Update the set of normalization-factors
      this.updateNormalizationFactors($stateParams.sel, $stateParams.ids, $stateParams.norm);

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
        norm = $stateParams.norm,
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
      this.updateSelection(sel, ids, norm);

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
     * @param norm
     *  The selected normalization factors.
     * @param refreshCheckMarks boolean
     *  True if has to re-mark the check marks in the sensors-menu.
     */
    this.updateSelection = function(sel, ids, norm, refreshCheckMarks) {
      $stateParams.sel = sel;
      $stateParams.ids = ids;

      this.filters.sel = sel;
      this.filters.ids = ids;

      if (norm != undefined) {
        $stateParams.norm = norm;
        this.filters.norm = norm;
      }

      // Refresh $state with new params.
      $state.refreshUrlWith($stateParams);

      if (refreshCheckMarks) {
        this.metersMenu.checkSelectedRows($stateParams);
      }

      // Update chart title in detailed-chart
      this.updateChartTitle();

      // Update map (if exists),
      if ((sel == 'site' || sel == 'meter') && this.markersMap) {
        this.markersMap.setSelectedMarkers(ids);
      }

      // Update the set of normalization-factors in detailed-chart.
      this.updateNormalizationFactors(sel, ids, norm);

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

          // Set filters so next time we'll really get the
          // electricity and sensor data.
          appState.filters.noData = false;

          // Got the summary, set time-frame limits from electricity, if there's one,
          // and from sensor-data if there's no electricity data.
          var params = {
            min: electricity ? electricity.summary.timestamp.min : sensorData.summary.timestamp.min,
            max: electricity ? electricity.summary.timestamp.max : sensorData.summary.timestamp.max
          };
          appState.period.config(params);

          // Update period and stateParams with new limits,
          // then get electricity and sensor data.
          periodChangedCleanupAndGetElectricity();
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

      periodChangedCleanupAndGetElectricity();
    };

    /**
     * Update the current selected objects, both in application-state and
     * in $stateParams.
     *
     * @param previous
     *  Timestamp of previous timeframe - for new period.
     * @param next
     *  Timestamp of next timeframe - for new period.
     */
    this.periodChangedPrevNext = function(previous, next) {
      this.period.getChartPeriod().setPeriod({newDate: next});

      periodChangedCleanupAndGetElectricity();
    };

    /**
     * Some housekeeping after changing period, then
     * get electricity and sensor data.
     */
    function periodChangedCleanupAndGetElectricity() {
      var chartPeriod = appState.period.getChartPeriod(),
        previous = chartPeriod.previous,
        next = chartPeriod.next;

      // Update filters with new limits.
      appState.filters.chartPreviousPeriod = previous;
      appState.filters.chartNextPeriod = next;

      // Update stateParams with new period.
      $stateParams.chartNextPeriod = next;
      $stateParams.chartPreviousPeriod = previous;
      $state.refreshUrlWith($stateParams);

      // Update date-range text near the chart title.
      var chartDateRange = appState.period.formatDateRange(previous * 1000, next * 1000);

      // ReferenceDate is used to communicate with the date selector,
      // update date-selector with current reference date.
      // Note that datepicker's referenceDate is in milliseconds.
      var chartReferenceDate = chartPeriod.referenceDate * 1000;

      // Update the chart with new period.
      appState.detailedChart.setup(chartDateRange, chartReferenceDate);

      // Get the electricity and sensor data.
      appState.getElectricityAndSensors(appState.filters);
    }

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
      // Helper function.
      function addMultipleFilter(filter, ids) {
        var filters = [];
        if (ids && ids.length > 1) {
          // If multiple IDs are given, output in the format:
          // filter[selector][operator] = IN
          // filter[selector][value][0] = val-1
          // filter[selector][value][1] = val-2
          // ... etc.
          filters['filter[' + filter + '][operator]'] = 'IN';
          var i = 0;
          angular.forEach(ids, function (id) {
            filters['filter[' + filter + '][value][' + i++ + ']'] = id;
          });
        }
        else {
          // A single ID was given, Output in the format:
          // filter[selector] = val
          filters['filter[' + filter + ']'] = ids[0];
        }
        return filters;
      }

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
          angular.extend(filters, addMultipleFilter(params.sel, idsArray));
        }
        // Check normalization-factors.
        if (params.norm) {
          filters['normalization_factors'] = params.norm;
        }
      }
      else {
        // Preparing filters for sensor.
        var idsArray = params.sensor ? params.sensor.split(',') : [];
        angular.extend(filters, addMultipleFilter('sensor', idsArray));
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
        var classLetter = Utils.prefixLetter($stateParams.sel);

        SensorTree.get($stateParams.accountId)
          .then(function(sensorTree) {
            selectedObjects = selectedObjects.map(function (id) {
              return sensorTree.collection[classLetter + id].name;
            });
            title = selectedObjects.join(', ');
            appState.detailedChart.setChartTitle(title);
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
            appState.detailedChart.setChartTitle(title);
          });
      }
    };

    /**
     * Update the set of normalization-factors for detailed-chart.
     *
     * Only when showing meters or sites. Look for the common factors of
     * all meters/sites selected, then send the list of factors to the
     * detailed-chart for display.
     *
     * @param sel
     *  Type of selection (as in $stateParams), e.g. 'meter', 'site', etc.
     * @param ids
     *  Comma separated list of selected meter/site ids (as in $stateParams).
     * @param norm
     *  Comma separated list of selected normalization factors (as in $stateParams).
     */
    this.updateNormalizationFactors = function(sel, ids, norm) {
      var factors = [],
        factors_selected = norm.split(',');

      SensorTree.get($stateParams.accountId)
        .then(function(sensorTree) {
          if (sel == 'meter' || sel == 'site') {
            var ids_array = ids.split(',');
            var classLetter = Utils.prefixLetter(sel);
            // Find common denominator of all normalization-factors.
            // Count how many times each factor appears. The ones that appear
            // as many times as the meters themselves, will remain.
            var factorsCount = {};
            angular.forEach(ids_array, function (id) {
              var sensor = sensorTree.collection[classLetter + id];
              angular.forEach(sensor.normalization_factors, function (factor) {
                factorsCount[factor.factor] = factorsCount[factor.factor] ? (factorsCount[factor.factor] + 1) : 1;
              })
            });
            // Gather all the common factors.
            angular.forEach(factorsCount, function(count, factor) {
              if (count == ids_array.length) {
                factors.push({
                  title: factor,
                  // Set selection flag for checkboxes of detailed-chart.
                  // True if the factor appears in 'sel' parameter.
                  selected: factors_selected.indexOf(factor) != -1
                });
              }
            })
          }
          appState.detailedChart.takeNormalizationFactors(factors);
        })
    };

    /**
     * Update the set of normalization-factors for detailed-chart.
     *
     * Only when showing meters or sites. Look for the common factors of
     * all meters/sites selected, then send the list of factors to the
     * detailed-chart for display.
     */
    this.selectNormalization = function(factor) {
      var ids = $stateParams.ids,
        sel = $stateParams.sel,
        norm = $stateParams.norm,
        objectsSelected = true;

      if (!factor.selected) {
        // factor unselected, remove it from state-params.
        var normalization_factors = norm.split(',');
        // object.id is a number, normalization_factors is an array of strings. Convert object.id to string.
        normalization_factors.splice(normalization_factors.indexOf(factor.title), 1);
        norm = normalization_factors.join();
      }
      else {
        // factor selected.
        var normalization_factors = norm ? norm.split(',') : [];
        normalization_factors.push(factor.title);
        norm = normalization_factors.join();
      }

      // Refresh $state with new params.
      this.updateSelection(sel, ids, norm);
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
