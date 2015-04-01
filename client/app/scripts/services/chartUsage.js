'use strict';

angular.module('negawattClientApp')
  .service('ChartUsage', function ($q, Electricity, UsagePeriod, Chart, moment) {
    var ChartUsage = this;

    // Frequencies information.
    var frequencies = [
      {
        frequency: 'year',
        label: 'שנה',
        type: '1'
      },
      {
        frequency: 'month',
        label: 'חודש',
        type: '2'
      },
      {
        frequency: 'day',
        label: 'יום',
        type: '3'
      },
      {
        frequency: 'hour',
        label: 'שעה',
        type: '4'
      },
      {
        frequency: 'minute',
        label: 'דקות',
        type: '5'
      }

    ];

    // Chart parameters that will be passed to google chart.
    this.usageGoogleChartParams = {};

    // List of used meters.
    this.meters;

    // Whether to draw multiple graphs or only one summary.
    this.multipleGraphs;

    // Chart parameters.
    this.usageChartParams = {
      frequency: 2
    };

    // Frequencies information.
    this.frequencyParams = {
      1: {
        frequency: 'year',
        label: 'שנה',
        type: '1',
        unit_num_seconds: 365 * 24 * 60 * 60,
        chart_default_time_frame: 10,
        chart_type: 'ColumnChart',
        axis_v_title: 'קוט"ש בחודש',
        axis_h_format: 'YYYY',
        axis_h_title: 'שנה'
      },
      2: {
        frequency: 'month',
        label: 'חודש',
        type: '2',
        unit_num_seconds: 31 * 24 * 60 * 60,
        chart_default_time_frame: 24,
        chart_type: 'ColumnChart',
        axis_v_title: 'קוט"ש בשנה',
        axis_h_format: 'MM-YYYY',
        axis_h_title: 'חודש'
      },
      3: {
        frequency: 'day',
        label: 'יום',
        type: '3',
        unit_num_seconds: 24 * 60 * 60,
        chart_default_time_frame: 14,
        chart_type: 'ColumnChart',
        axis_v_title: 'קוט"ש ביום',
        axis_h_format: 'DD-MM',
        axis_h_title: 'תאריך'
      },
      4: {
        frequency: 'hour',
        label: 'שעה',
        type: '4',
        unit_num_seconds: 60 * 60,
        // One week.
        chart_default_time_frame: 168,
        chart_type: 'LineChart',
        axis_v_title: 'KW',
        axis_h_format: 'HH',
        axis_h_title: 'שעה'
      },
      5: {
        frequency: 'minute',
        label: 'דקות',
        type: '5',
        unit_num_seconds: 60,
        // 48 hours.
        chart_default_time_frame: 1440,
        chart_type: 'LineChart',
        axis_v_title: 'KW',
        axis_h_format: 'HH',
        axis_h_title: 'שעה'
      }
    };

    // Store the filters-hash code of the active request.
    // Used to prevent updating the chart when there are several active
    // requests in parallel.
    this.activeRequestHash;

    // A map from filters-hash code to chart-frequency.
    this.filtersHashToFreq = {};

    /**
     * Returns the filters-hash code of the active GET request.
     *
     * @returns {string}
     *   Filters-hash code of the active GET request.
     */
    this.getActiveRequestHash = function() {
      return this.activeRequestHash;
    };

    /**
     * Translate selector type and ID to filters.
     *
     * @param accountId
     *   User account ID.
     * @param chartFreq
     *   Required frequency, e.g. 2 for MONTH.
     * @param selectorType
     *   Type of filter, e.g. 'meter' or 'meter_category'.
     * @param selectorId
     *   ID of the selector, e.g. meter ID or category ID.
     * @param period
     *   Object with the period selected.
     *
     * @returns {Object}
     *   Filters array in the form required by get().
     */
    this.filtersFromSelector = function(accountId, chartFreq, selectorType, selectorId, period) {

      // Prepare filters for data request.
      var filters = {
        'filter[meter_account]': accountId,
        'filter[type]': chartFreq || this.usageChartParams.frequency,
        'filter[timestamp][operator]': 'BETWEEN',
        'filter[timestamp][value][0]': period.previous, // chartBeginTimestamp,
        'filter[timestamp][value][1]': period.next // chartEndTimestamp
      };

      if (selectorType) {
        if (this.multipleGraphs) {
          // If multiple IDs are given, output in the format:
          // filter[selector][operator] = IN
          // filter[selector][value][0] = val-1
          // filter[selector][value][1] = val-2
          // ... etc.
          filters['filter[' + selectorType + '][operator]'] = 'IN';
          var i = 0;
          angular.forEach(selectorId, function (id) {
            filters['filter[' + selectorType + '][value][' + i++ +']'] = id;
          });
        }
        else {
          // A single ID was given, Output in the format:
          // filter[selector] = val
          filters['filter[' + selectorType + ']'] = selectorId;
        }
      }

      return filters;
    };

    /**
     * Get electricity data and convert it to chart format.
     *
     * @param accountId
     *   User account ID.
     * @param stateParams
     *   State parameters, including frequency, marker-id, etc.
     * @param period
     *   Period of time to use in the electricity request.
     *
     * @returns {*}
     *   Promise for data in google-chart format.
     */
    this.get = function(accountId, stateParams, meters, period) {
      var deferred = $q.defer();

      var chartFreq = stateParams.chartFreq;
      var chart = this.frequencyParams[chartFreq];

      // Save meters data.
      this.meters = meters;

      // Decipher selector type and id out of stateParams.
      var selectorType, selectorId;
      if (stateParams.markerId) {
        selectorType = 'meter';
        selectorId = stateParams.markerId.split(',');
        this.multipleGraphs = (selectorId.length > 1);
      }
      else if (stateParams.categoryId) {
        selectorType = 'meter_category';
        selectorId = stateParams.categoryId;
        this.multipleGraphs = false;
      }

      // Caculate period object.
      UsagePeriod.setPeriod(chart, period);

      // Update period information.
      period = UsagePeriod.getPeriod();

      // Translate selector type and id to filters.
      var filters = this.filtersFromSelector(accountId, chartFreq, selectorType, selectorId, period);

      // Save filters-hash code and map to frequency for later use.
      var filtersHash = Electricity.hashFromFilters(filters);
      this.activeRequestHash = filtersHash;
      this.filtersHashToFreq[filtersHash] = chartFreq;

      // Get electricity data.
      Electricity.get(filters).then(function(electricity) {
        // Add periods.
        angular.extend(ChartUsage.usageGoogleChartParams, UsagePeriod)
        // Translate electricity data to google charts format.
        deferred.resolve(ChartUsage.electricityToChartData(chartFreq, electricity));
      });

      return deferred.promise;
    };

    /**
     * Get electricity data and convert it to chart format.
     *
     * Uses filters-hash code as a key to get electricity data.
     *
     * @param filtersHash
     *   Filters-hash code.
     *
     * @returns {*}
     *   Promise for data in google-chart format.
     */
    this.getByFiltersHash = function(filtersHash) {
      var deferred = $q.defer();

      // Find chart-frequency.
      var chartFreq = this.filtersHashToFreq[filtersHash];

      // Get electricity data.
      Electricity.getByFiltersHash(filtersHash).then(function(electricity) {
        // Translate electricity data to google charts format.
        deferred.resolve(ChartUsage.electricityToChartData(chartFreq, electricity));
      });

      return deferred.promise;
    };

    /**
     * Converts electricity data to chart format.
     *
     * @param chartFreq
     *   Required frequency, e.g. 2 for MONTH.
     * @param electricity
     *   Electricity data.
     *
     * @returns {*}
     *   Data in google-chart format.
     */
    this.electricityToChartData = function(chartFreq, electricity) {
      // Get frequency-info record.
      var chartFrequency = chartFreq || this.usageChartParams.frequency;
      var chartFrequencyInfo = this.frequencyParams[chartFrequency];

      // Translate electricity data to google charts format.
      angular.extend(ChartUsage.usageGoogleChartParams, ChartUsage.transformDataToDatasets(electricity, chartFrequencyInfo));
      return ChartUsage.usageGoogleChartParams;
    };

    /**
     * Update chart after meter was changed.
     *
     * @param meter
     *   New meter ID.
     */
    this.meterSelected = function(meter) {
      // Get meter name
      var chartTitle = 'צריכת חשמל';
      // @fixme: Handle multiple graphs here.
      if (this.usageGoogleChartParams && angular.isDefined(meter)) {
        chartTitle = meter.place_description + ', ' +
          meter.place_address + ', ' +
          meter.place_locality;

        // Set chart title
        this.usageGoogleChartParams.options.title = chartTitle;
      }
    };

    /**
     *  From the object received from the server transforming to chart object format.
     *
     *  source object:
     *  --------------
     *
     *    data: [
     *        {
     *          timestamp: "1356991200"
     *          rate_type: "flat"
     *          type: 2
     *          kwh: "10936"
     *          avg_power: "12.5664"
     *          meter: 10
     *          meter_category: "6"
     *          meter_account: "2"
     *          min_power_factor: "0.98"
     *        },
     *        ...
     *      ]
     *
     *
     *  target object:
     *  --------------
     *    ...chart options....,
     *    data:
     *      {
     *        cols:
     *          [
     *            { id: 'month', label: 'Month', type: 'string' },
     *            { id: 'val1', label: 'Value 1', type: 'number' },
     *            ...
     *          ],
     *        rows:
     *          [
     *            { c: [ {v: 'Jan'}, {v: 123}, {v: 123}, ... ] },
     *            { c: [ {v: 'Feb'}, {v: 123}, {v: 123}, ... ] },
     *            ...
     *          ]
     *      }
     *
     * @param {data} data
     *    Source object in electricity format.
     * @param {Object} chartFrequencyInfo
     *    Chart frequency info, as defined in this.frequencyParams.
     *
     * @returns {Object}
     *    Target data in google charts' datasets format.
     **/
    this.transformDataToDatasets = function(data, chartFrequencyInfo) {

      var cols = [], rows = [];
      // Will hold a temp array like { time: [v1, v2, v3,...], time: [..], ..}.
      var values = {};

      if (this.multipleGraphs) {
        // Prepare data for multiple graphs.
        // ----------------------------------

        // Map from meter ID to index into values.
        var metersMap = {};
        var numMeters = 0;

        angular.forEach(data, function (item) {
          if (!(item.timestamp in values)) {
            // Never encountered this timestamp, create an empty object.
            values[item.timestamp] = [];
          }
          if (!(item.meter in metersMap)) {
            // Never encountered this meter, create a zero value.
            metersMap[item.meter] = numMeters++;
          }
          // Save the kWhs.
          // Must sum here, since we might have several rate-types for each
          // meter and timestamp.
          var value = values[item.timestamp][metersMap[item.meter]] || 0;
          values[item.timestamp][metersMap[item.meter]] = value + +item.kwh;
        });

        // Prepare cols array.
        cols = [
          {
            'id': 'month',
            'label': 'חודש',
            'type': 'string',
            'p': {}
          }
        ];

        // Add meters to cols array.
        angular.forEach(metersMap, function (index, meterId) {
          var label = ChartUsage.meters[meterId].label;
          cols.push({
            'id': meterId,
            'label': label,
            'type': 'number',
            'p': {}
          });
        });

        // Build rows array
        angular.forEach(values, function (item, timestamp) {
          var label = moment.unix(timestamp).format(chartFrequencyInfo.axis_h_format);
          // First value is the label.
          var col = [{'v': label}];
          // Loop and add meter values to column data.
          for (var i = 0; i < numMeters; i++) {
            col.push({'v': item[i]});
          };
          rows.push({'c': col});
        });
      }
      else {
        // Prepare data for a single graph
        // ----------------------------------

        // Create a temp array like { time: {low: 1, mid:4, peak:5}, time: {..}, ..}.
        var prevRateType;
        var isLineChart = (chartFrequencyInfo.chart_type == 'LineChart');

        angular.forEach(data, function(item) {
          if (!(item.timestamp in values)) {
            // Never encountered this timestamp, create an empty object
            values[item.timestamp] = {};
          }
          // Save the kWhs.
          values[item.timestamp][item.rate_type] = +item.kwh;

          // Handle problem with line chart:
          // If having TOUse data, the lines should be elongated one data point forward
          // when changing rate-type in order to 'connect' the lines of the different
          // charts.
          if (isLineChart && prevRateType && prevRateType != item.rate_type) {
            values[item.timestamp][prevRateType] = +item.kwh;
          }

          prevRateType = item.rate_type;
        });

        // Prepare cols
        cols = [
          {
            'id': 'month',
            'label': 'Month',
            'type': 'string',
            'p': {}
          },
          {
            'id': 'flat',
            'label': 'אחיד',
            'type': 'number',
            'p': {}
          },
          {
            'id': 'peak',
            'label': 'פסגה',
            'type': 'number',
            'p': {}
          },
          {
            'id': 'mid',
            'label': 'גבע',
            'type': 'number',
            'p': {}
          },
          {
            'id': 'low',
            'label': 'שפל',
            'type': 'number',
            'p': {}
          }
        ];

        // Build rows
        angular.forEach(values, function(item, timestamp) {
          var label = moment.unix(timestamp).format(chartFrequencyInfo.axis_h_format);
          var col = [
            { 'v': label },
            { 'v': item.flat },
            { 'v': item.peak },
            { 'v': item.mid  },
            { 'v': item.low  }
          ];
          rows.push({ 'c': col });
        });
      }

      // Construct chart data object.
      var chartData = {
        'type': chartFrequencyInfo.chart_type,
        'data': {
          'cols': cols,
          'rows': rows
        },
        'options': {
          'isStacked': 'true',
          bar: { groupWidth: '75%' },
          'fill': 20,
          'displayExactValues': true,
          'vAxis': {
            'title': chartFrequencyInfo.axis_v_title,
            'gridlines': {
              'count': 6
            }
          },
          'hAxis': {
            'title': chartFrequencyInfo.axis_h_title
          }
        }
      };

      angular.extend(chartData, Chart);

      return chartData;
    };

    /**
     * Return the frequencies collection.
     *
     * @returns {{frequency: string, label: string, type: string}[]}
     *  The frequencies colleciton.
     */
    this.getFrequencies = function() {
      return frequencies;
    }

  });
