'use strict';

angular.module('negawattClientApp')
  .service('ChartUsage', function ($q, moment) {
    var ChartUsage = this;

    // Chart parameters that will be passed to google chart.
    this.usageGoogleChartParams;

    // Chart parameters.
    this.usageChartParams = {
      frequency: 5
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
        chart_type: 'ColumnChart'
      },
      2: {
        frequency: 'month',
        label: 'חודש',
        type: '2',
        unit_num_seconds: 31 * 24 * 60 * 60,
        chart_default_time_frame: 24,
        chart_default_time_frame_end: 'now',
        chart_type: 'ColumnChart'
      },
      3: {
        frequency: 'day',
        label: 'יום',
        type: '3',
        unit_num_seconds: 24 * 60 * 60,
        chart_default_time_frame: 14,
        // @fixme: hard coded timestamp here (and below).
        chart_default_time_frame_end: 1388620800,
        chart_type: 'ColumnChart'
      },
      4: {
        frequency: 'hour',
        label: 'שעה',
        type: '4',
        unit_num_seconds: 60 * 60,
        chart_default_time_frame: 48,
        chart_default_time_frame_end: 1388620800,
        chart_type: 'LineChart'
      },
      5: {
        frequency: 'minute',
        label: 'דקות',
        type: '5',
        unit_num_seconds: 60,
        chart_default_time_frame: 48 * 60,
        chart_default_time_frame_end: 1388620800,
        chart_type: 'LineChart'
      }
    };

    /**
     * Translate selector type and ID to filters.
     *
     * @param selector_type
     *   Type of filter, e.g. 'meter' or 'meter_category'.
     * @param id
     *   ID of the selector, e.g. meter ID or category ID.
     *
     * @returns
     *   Filters array in the form required by get().
     */
    this.filtersFromSelector = function(selectorType, selectorId) {
      // Calculate the time-frame for data request.
      var chartFrequency = this.usageChartParams.frequency;
      var chartFrequencyInfo = this.frequencyParams[chartFrequency];
      var chartTimeFrame = chartFrequencyInfo.chart_default_time_frame;
      var chartEndTimestamp = chartFrequencyInfo.chart_default_time_frame_end == 'now' ? Math.floor(Date.now() / 1000) : chartFrequencyInfo.chart_default_time_frame_end;
      var chartBeginTimestamp = chartEndTimestamp - chartTimeFrame * chartFrequencyInfo.unit_num_seconds;

      // Prepare filters for data request.
      var filters = {
        type: chartFrequency,
        timestamp: {
          value: [chartBeginTimestamp, chartEndTimestamp],
          operator: 'BETWEEN'
        }
      };
      if (selectorType) {
        filters[selectorType] = selectorId;
      }

      return filters;
    };

    /**
     * Update chart after data was changed.
     *
     * After electricity data was received from the server, reformat response to
     * shape it in google chart's format.
     *
     * @param electricity
     *   New electricity data.
     *
     * @returns
     *   Data in google-chart format.
     */
    this.get = function(electricity) {
      // Get frequency-info record.
      var chartFrequency = this.usageChartParams.frequency;
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
      if (this.usageGoogleChartParams) {
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
        if (!(item.rate_type in values[item.timestamp])) {
          // Never encountered this rate type, put a zero entry
          values[item.timestamp][item.rate_type] = 0;
        }
        // Sum the kWhs. Might have several meters with the same ts and rate-type...
        // @fixme: since restful now returns totals only, there shouldn't be multiple meters...
        values[item.timestamp][item.rate_type] += +item.kwh;

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
      var rows = [];
      angular.forEach(values, function(item, timestamp) {
        var label = moment.unix(timestamp).format('MM-YYYY');
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
        'cssStyle': 'height:210px; width:500px;',
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
            'title': 'קוט"ש בחודש',
            'gridlines': {
              'count': 6
            }
          },
          'hAxis': {
            'title': 'חודש'
          }
        },
        'formatters': {},
        'displayed': true
      };

      return chartData;
    }

  });
