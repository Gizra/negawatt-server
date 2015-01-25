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

    /**
     * Get the chart data and plot.
     *
     * Get chart data from server according to given filter.
     * Reformat response to shape it in chart's format.
     *
     * @param type
     *   type of filter, e.g. 'meter', 'category'.
     * @param id
     *   id of the object selected.
     * @returns {$q.promise}
     */
    this.get = function(type, id) {
      var deferred = $q.defer();

      // Limit date to 2 year back
      var twoYearsBack = Math.floor(Date.now() / 1000) - 2 * 365 * 24 * 60 * 60;

      var filters = {
        // type 2 = month
        type: '2',
        timestamp: {
          value: twoYearsBack,
          operator: '>'
        }
      };
      if (type) {
        filters[type] = id;
      }

      // Get chart data object.
      Electricity.get(filters)
        .then(function(response) {
          // Reformat usage data for chart usage
          ChartUsage.usageChartParams = ChartUsage.transformDataToDatasets(response);
          deferred.resolve(ChartUsage.usageChartParams);
        });

      return deferred.promise;
    };

    this.meterSelected = function(meter) {
      // Get meter name
      var chartTitle = 'צריכת חשמל';
      if (this.usageChartParams) {
        chartTitle = meter.place_description + ', ' +
        meter.place_address + ', ' +
        meter.place_locality;

        // Set chart title
        this.usageChartParams.options.title = chartTitle;
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
     *   source object in electricity format.
     * @returns {Object}
     *   target data in charts' datasets format.
     **/
    this.transformDataToDatasets = function(data) {

      // Create a temp array like { time: {low: 1, mid:4, peak:5}, time: {..}, ..}.
      var values = {};
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
        values[item.timestamp][item.rate_type] += +item.kwh;
      });

      // Prepare cols
      var cosl = [
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
        'type': 'ColumnChart',
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
