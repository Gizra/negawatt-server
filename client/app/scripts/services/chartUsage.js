'use strict';

angular.module('negawattClientApp')
  .service('ChartUsage', function ($q, Electricity, moment) {
    var ChartUsage = this;

    // Chart parameters that will be passed to google chart.
    this.usageGoogleChartParams;

    // Chart parameters.
    this.usageChartParams = {
      frequency: 4
    };

    // Frequencies information.
    this.frequencyParams = {
      1: {
        frequency: 'year',
        label: 'שנה',
        type: '1',
        unit_num_seconds: 365 * 24 * 60 * 60,
        chart_default_time_frame: 10,
        chart_type: 'ColumnChart'
      },
      2: {
        frequency: 'month',
        label: 'חודש',
        type: '2',
        unit_num_seconds: 31 * 24 * 60 * 60,
        chart_default_time_frame: 24,
        chart_type: 'ColumnChart'
      },
      3: {
        frequency: 'day',
        label: 'יום',
        type: '3',
        unit_num_seconds: 24 * 60 * 60,
        chart_default_time_frame: 14,
        chart_type: 'ColumnChart'
      },
      4: {
        frequency: 'hour',
        label: 'שעה',
        type: '4',
        unit_num_seconds: 60 * 60,
        chart_default_time_frame: 48,
        chart_type: 'LineChart'
      },
      5: {
        frequency: 'minute',
        label: 'דקות',
        type: '5',
        unit_num_seconds: 60,
        chart_default_time_frame: 48 * 60,
        chart_type: 'LineChart'
      }
    };

    /**
     * Get the chart data and plot.
     *
     * Get chart data from server according to given filter.
     * Reformat response to shape it in chart's format.
     *
     * @param selector_type
     *   type of filter, e.g. 'meter', 'category'.
     * @param id
     *   id of the object selected.
     * @returns {$q.promise}
     */
    this.get = function(selector_type, id) {
      var deferred = $q.defer();

      var chart_frequency = this.usageChartParams.frequency;
      var chart_frequency_info = this.frequencyParams[chart_frequency];
      var chart_timeframe = chart_frequency_info.chart_default_time_frame;
      var chart_end_timestamp = 1388620800; // Hard code 2/1/2014 for now. Should be: Math.floor(Date.now() / 1000);
      var chart_begin_timestamp = chart_end_timestamp - chart_timeframe * chart_frequency_info.unit_num_seconds;

      var filters = {
        type: chart_frequency,
        timestamp: {
          value: [chart_begin_timestamp, chart_end_timestamp],
          operator: 'BETWEEN'
        }
      };
      if (selector_type) {
        filters[selector_type] = id;
      }

      // Get chart data object.
      Electricity.get(filters)
        .then(function(response) {
          // Reformat usage data for chart usage
          ChartUsage.usageGoogleChartParams = ChartUsage.transformDataToDatasets(response, chart_frequency_info);
          deferred.resolve(ChartUsage.usageGoogleChartParams);
        });

      return deferred.promise;
    };

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
     * @param {Object} chart_frequency_info
     *    Chart frequency info, as defined in this.frequencyParams.
     *
     * @returns {Object}
     *    Target data in charts' datasets format.
     **/
    this.transformDataToDatasets = function(data, chart_frequency_info) {

      // Create a temp array like { time: {low: 1, mid:4, peak:5}, time: {..}, ..}.
      var values = {};
      var prev_rate_type;
      var line_chart = (chart_frequency_info.chart_type == 'LineChart');
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
        // If haveing TOUse data, the lines should be elongated one data point forward
        // when changing rate-type in order to 'connect' the lines of the different
        // charts.
        if (line_chart && prev_rate_type && prev_rate_type != item.rate_type) {
          values[item.timestamp][prev_rate_type] = +item.kwh;
        }

        prev_rate_type = item.rate_type;
      });

      // Prepare cols
      var cosl = [
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
        var label = moment.unix(timestamp).format('MM-YYYY')
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
        'type': chart_frequency_info.chart_type, //'ColumnChart',
        'cssStyle': 'height:210px; width:500px;',
        'data': {
          'cols': cosl,
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
