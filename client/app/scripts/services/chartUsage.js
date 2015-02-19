'use strict';

angular.module('negawattClientApp')
  .service('ChartUsage', function ($q, Electricity, moment) {
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
    this.usageGoogleChartParams;

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
        chart_default_time_frame_end: 'now',
        chart_type: 'ColumnChart',
        vaxis_title: 'קוט"ש בחודש',
        haxis_format: 'YYYY',
        haxis_title: 'שנה'
      },
      2: {
        frequency: 'month',
        label: 'חודש',
        type: '2',
        unit_num_seconds: 31 * 24 * 60 * 60,
        chart_default_time_frame: 24,
        chart_default_time_frame_end: 'now',
        chart_type: 'ColumnChart',
        vaxis_title: 'קוט"ש בשנה',
        haxis_format: 'MM-YYYY',
        haxis_title: 'חודש'
      },
      3: {
        frequency: 'day',
        label: 'יום',
        type: '3',
        unit_num_seconds: 24 * 60 * 60,
        chart_default_time_frame: 14,
        // @fixme: hard coded timestamp here (and below).
        chart_default_time_frame_end: 1388620800,
        chart_type: 'ColumnChart',
        vaxis_title: 'קוט"ש ביום',
        haxis_format: 'DD-MM',
        haxis_title: 'תאריך'
      },
      4: {
        frequency: 'hour',
        label: 'שעה',
        type: '4',
        unit_num_seconds: 60 * 60,
        chart_default_time_frame: 48,
        chart_default_time_frame_end: 1388620800,
        chart_type: 'LineChart',
        vaxis_title: 'KW',
        haxis_format: 'HH',
        haxis_title: 'שעה'
      },
      5: {
        frequency: 'minute',
        label: 'דקות',
        type: '5',
        unit_num_seconds: 60,
        chart_default_time_frame: 48 * 60,
        chart_default_time_frame_end: 1388620800,
        chart_type: 'LineChart',
        vaxis_title: 'KW',
        haxis_format: 'HH',
        haxis_title: 'שעה'
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
     *
     * @returns {Object}
     *   Filters array in the form required by get().
     */
    this.filtersFromSelector = function(accountId, chartFreq, selectorType, selectorId) {
      // Calculate the time-frame for data request.
      var chartFrequency = chartFreq || this.usageChartParams.frequency;
      // Fix a bug when there are two chartFrequency params in url's search
      // string (issue #338).
      // @todo: Remove after the bug is fixed.
      if (chartFrequency instanceof Array) {
        chartFrequency = chartFrequency[0];
      }
      var chartFrequencyInfo = this.frequencyParams[chartFrequency];
      var chartTimeFrame = chartFrequencyInfo.chart_default_time_frame;
      var chartEndTimestamp = chartFrequencyInfo.chart_default_time_frame_end == 'now' ? Math.floor(Date.now() / 1000) : chartFrequencyInfo.chart_default_time_frame_end;
      var chartBeginTimestamp = chartEndTimestamp - chartTimeFrame * chartFrequencyInfo.unit_num_seconds;

      // Prepare filters for data request.
      var filters = {
        'filter[meter_account]': accountId,
        'filter[type]': chartFrequency,
        'filter[timestamp][operator]': 'BETWEEN',
        'filter[timestamp][value][0]': chartBeginTimestamp,
        'filter[timestamp][value][1]': chartEndTimestamp
      };

      if (selectorType) {
        filters['filter['+selectorType+']'] = selectorId;
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
     *
     * @returns {*}
     *   Promise for data in google-chart format.
     */
    this.get = function(accountId, stateParams) {
      var deferred = $q.defer();

      // Decipher selector type and id out of stateParams.
      var selectorType, selectorId;
      if (stateParams.markerId) {
        selectorType = 'meter';
        selectorId = stateParams.markerId;
      }
      else if (stateParams.categoryId) {
        selectorType = 'meter_category';
        selectorId = stateParams.categoryId;
      }

      // Translate selector type and id to filters.
      var filters = this.filtersFromSelector(accountId, stateParams.chartFreq, selectorType, selectorId);

      // Save filters-hash code and map to frequency for later use.
      var filtersHash = Electricity.hashFromFilters(filters);
      this.activeRequestHash = filtersHash;
      this.filtersHashToFreq[filtersHash] = stateParams.chartFreq;

      // Get electricity data.
      Electricity.get(filters).then(function(electricity) {
        // Translate electricity data to google charts format.
        deferred.resolve(ChartUsage.electricityToChartData(stateParams.chartFreq, electricity));
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
      // Fix a bug when there are two chartFrequency params in url's search
      // string (issue #338).
      // @todo: Remove after the bug is fixed.
      if (chartFrequency instanceof Array) {
        chartFrequency = chartFrequency[0];
      }

      var chartFrequencyInfo = this.frequencyParams[chartFrequency];

      // Translate electricity data to google charts format.
      ChartUsage.usageGoogleChartParams = ChartUsage.transformDataToDatasets(electricity, chartFrequencyInfo);
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
     *          0: Object
     *          id: 38
     *          kwh: "10936"
     *          meter: Object
     *          min_power_factor: "0"
     *          rate_type: "flat"
     *          timestamp: "1356991200"
     *          type: "month"
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

      // Create a temp array like { time: {low: 1, mid:4, peak:5}, time: {..}, ..}.
      var values = {};
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
      var cols = [
        {
          'id': 'month',
          'label': 'חודש',
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
      var rows = [];
      angular.forEach(values, function(item, timestamp) {
        var label = moment.unix(timestamp).format(chartFrequencyInfo.haxis_format);
        var col = [
          { 'v': label },
          { 'v': item.flat },
          { 'v': item.peak },
          { 'v': item.mid  },
          { 'v': item.low  }
          ];
        rows.push({ 'c': col });
      });

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
            'title': chartFrequencyInfo.vaxis_title,
            'gridlines': {
              'count': 6
            }
          },
          'hAxis': {
            'title': chartFrequencyInfo.haxis_title
          }
        }
      };

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
