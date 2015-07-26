angular.module('negawattClientApp')
  .filter('toChartDataset', function (Chart, ChartOptions, moment) {

    /**
     * From a collection object create a Google Chart data ser object
     * according the type.
     *
     * @param collection
     *  The collection to format.
     *
     * @returns {*}
     *  The dataset collection filtered.
     */
    return function (collection){
      var chartFrequencyActive = Chart.getActiveFrequency();
      // Recreate collection object.
      collection = {
        type: chartFrequencyActive.chart_type,
        data: getDataset(collection, chartFrequencyActive),
        options: getOptions(chartFrequencyActive)
      }
      return collection;
    }

    /**
     * Return the options of the selected chart.
     *
     * @param chartFrequencyActive
     *  The specific chart options of the seleted frequency.
     * @returns {*}
     *  Chart options object.
     */
    function getOptions(chartFrequencyActive) {
      return angular.extend(ChartOptions[chartFrequencyActive.chart_type],
        {
          vAxis: {
            title: chartFrequencyActive.axis_v_title
          },
          hAxis: {
            // No title in order to have enough space for the bars labels.
          }
        });
    }

    /**
     * Return the object with the dataset based on the collection object.
     *
     * @param collection
     *  The collection to format.
     * @param frequency
     *  The active frequency.
     * @returns {{cols: *[], rows: Array}}
     */
    function getDataset(collection, frequency) {
      var dataset = {
        // Add columns.
        cols: [
          {
            'id': 'month',
            'label': 'Month',
            'type': 'string',
          },
          {
            'id': 'flat',
            'label': 'אחיד',
            'type': 'number',
          },
          {
            'id': 'peak',
            'label': 'פסגה',
            'type': 'number',
          },
          {
            'id': 'mid',
            'label': 'גבע',
            'type': 'number',
          },
          {
            'id': 'low',
            'label': 'שפל',
            'type': 'number',
          },
          {
            'id': 'estimate',
            'label': 'הערכה',
            'type': 'number',
          }
        ],
        // Add rows.
        rows: getRows(collection, 'single', frequency),
      };

      return dataset;
    };

    /**
     * Return the collection data in the type of the two chart type indicated.
     *
     * @param collection
     *  The collection to filter.
     * @param type
     *  The type of the rows will request.
     * @param frequency
     *  The active frequency.
     *
     * @returns {Array}
     *  An array of the data ordering as the type requested.
     */
    function getRows(collection, type, frequency) {
      var values = {};
      var rows = [];
      var prevRateType;
      var isLineChart;
      var powerValueProperty = getPowerValueProperty(frequency);

      if (type === 'single') {
        // Prepare data for a single graph
        // ----------------------------------

        // Create a temp array like { time: {low: 1, mid:4, peak:5}, time: {..}, ..}.
        isLineChart = frequency.chart_type === 'LineChart';

        angular.forEach(collection, function(item) {
          if (!(item.timestamp in values)) {
            // Never encountered this timestamp, create an empty object
            values[item.timestamp] = {};
          }
          // Save the average power.
          values[item.timestamp][item.rate_type] = +item[powerValueProperty];

          // Handle problem with line chart:
          // If having TOUse data, the lines should be elongated one data point forward
          // when changing rate-type in order to 'connect' the lines of the different
          // charts.
          if (isLineChart && prevRateType && prevRateType != item.rate_type) {
            values[item.timestamp][prevRateType] = +item[powerValueProperty];
          }

          prevRateType = item.rate_type;
        });

        // Build rows
        angular.forEach(values, function(item, timestamp) {
          var label = moment.unix(timestamp).format(frequency.axis_h_format);
          var col = [
            { 'v': label },
            { 'v': item.flat },
            { 'v': item.peak },
            { 'v': item.mid  },
            { 'v': item.low  },
            { 'v': item.estimate  }
          ];
          rows.push({ 'c': col });
        });
      }

      return rows;
    }

    /**
     * Return power property name according the type, to get the value.
     *
     * @param frequency
     *  The active frequency.
     *
     * @returns {string}
     *  The rate type value.
     */
    function getPowerValueProperty(frequency) {
      frequency = +frequency.type;
      if([1,2,3].indexOf(frequency) !== -1) {
        return 'kwh';
      }

      if([4,5].indexOf(frequency) !== -1) {
        return 'avg_power';
      }
    }

  });
