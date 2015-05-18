'use strict';

angular.module('negawattClientApp')
  .service('ChartUsage', function ($q, UsagePeriod, FilterFactory, Utils, Chart, moment) {
    var ChartUsage = angular.extend(this, Chart);


    // Chart parameters that will be passed to google chart.
    //this.usageGoogleChartParams = {};

    // Store the filters-hash code of the active request.
    // Used to prevent updating the chart when there are several active
    // requests in parallel.
    //this.activeRequestHash;
    //
    //// A map from filters-hash code to chart-frequency.
    //this.filtersHashToFreq = {};
    //
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
     * Get electricity data and convert it to chart format.
     *
     * @param accountId
     *   User account ID.
     * @param type
     *   chartFreq state parameters, including frequency, marker-id, etc.
     * @param period
     *   Period of time to use in the electricity request.
     *
     * @returns {*}
     *   Promise for data in google-chart format.
     */
    this.render = function(accountId, stateParams, period) {
      var deferred = $q.defer();
      // Keep compatibility with the actual architecture.
      var params = FilterFactory.get('electricity')
      var chart = Chart.getFrequency(params.chartFreq);

      // Set the chart graph as multi graph
      Chart.multipleGraphs = angular.isArray(params.selectorId) || false;

      // Caculate period object.
      // @TODO: Move to FilterFactory
      UsagePeriod.setPeriod(chart, params.period);
      // Update period information.
      period = UsagePeriod.getPeriod();

      // Get electricity data.
      //Electricity.get(params.filters).then(function(electricity) {
      //  // Add periods.
      //  angular.extend(ChartUsage.usageGoogleChartParams, UsagePeriod)
      //  // Translate electricity data to google charts format.
      //  deferred.resolve(ChartUsage.electricityToChartData(params.chartFreq, electricity));
      //});
      deferred.resolve();

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
    this.f = function(filtersHash) {
      /// @TODO: Move to directive remove extra promise event.
      var deferred = $q.defer();

      // Find chart-frequency.
      var chartFreq = this.filtersHashToFreq[filtersHash];

      // Get electricity data.
      /// @TODO: Move to resolve
      //Electricity.getByFiltersHash(filtersHash).then(function(electricity) {
      //  // Translate electricity data to google charts format.
      //  deferred.resolve(ChartUsage.electricityToChartData(chartFreq, electricity));
      //});
      deferred.resolve();

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
      var chartFrequency = chartFreq;
      var chartFrequencyInfo = Chart.getFrequency(chartFreq);

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
     *    Chart frequency info, as defined in Chart.getFrequency(chartFreq).
     *
     * @returns {Object}
     *    Target data in google charts' datasets format.
     **/
    this.transformDataToDatasets = function(data, chartFrequencyInfo) {

      var cols = [], rows = [];
      // Will hold a temp array like { time: [v1, v2, v3,...], time: [..], ..}.
      var values = {};

      if (Chart.multipleGraphs) {
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
          'bar': { groupWidth: '75%' },
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


      return chartData;
    };


  });
