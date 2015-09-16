angular.module('negawattClientApp')
  .filter('toChartDataset', function ($filter, Chart, ChartOptions, moment, $window) {

    /**
     * From a collection object create a Google Chart data ser object
     * according the type.
     *
     * @param collection
     *  The collection to format.
     * @param chartType
     *  One of 'sum', 'detailed', 'stacked', 'percent'.
     *   sum: sum several meters to one column.
     *   detailed: display different meters side-be-side.
     *   stacked: stack meters to one column.
     *   percent: stack and stretch so all columns are the same height.
     * @param compareWith
     *  A collection with will be compare.
     * @param options
     *  The chart options.
     *
     * @returns {*}
     *  The dataset collection filtered.
     */
    return function (collection, chartType, compareWith, options, labels, labelsField, compareLabelsField, oneItemSelected) {

      // chartType defaults to detailed.
      chartType = chartType ? chartType : 'detailed';
      // However, if there's only one item, revert to 'sum', that will display only one
      // meter/category, but split into TOUse rate-types.
      if (chartType == 'detailed' && oneItemSelected) {
        chartType = 'sum';
      }

      var chartFrequencyActive = Chart.getActiveFrequency();

      // Check if asked to return chart options only.
      if (collection == 'options-only') {
        return ChartOptions.getOptions(chartFrequencyActive, chartType);
      }

      options = ChartOptions.getOptions(chartFrequencyActive.type, chartType);

      //if (compareWith) {
      //  collection = collection.concat(compareWith);
      //}

      // Recreate collection object.
      collection = {
        type: options.chart_type,
        data: getDataset(collection, chartFrequencyActive, chartType, labels, labelsField, compareWith, compareLabelsField),
        options: options
      };
      return collection;
    };

    /**
     * Return the object with the dataset based on the collection object.
     *
     * @param collection
     *  The collection to format.
     * @param frequency
     *  The active frequency.
     * @param chartType
     *  One of 'sum', 'detailed', 'stacked', 'percent'.
     * @param labels
     *  An indexed-array id => object.
     * @param labelsField
     *  The name of the label field in labels' objects.
     *
     * @returns {{cols: *[], rows: Array}}
     */
    function getDataset(collection, frequency, chartType, labels, labelsField, compareWith, compareLabelsField) {
      var labelsUsed = [];
      var dataset = {
        // Add rows.
        rows: getRows(collection, frequency, chartType, labelsUsed, labelsField, compareWith, compareLabelsField),
        // Add columns.
        cols: getColumns(collection, frequency, chartType, labelsUsed, labels, compareWith)
      };

      return dataset;
    }

    /**
     * Return the collection data in the type of the two chart type indicated.
     *
     * @param collection
     *  The collection to filter.
     * @param frequency
     *  The active frequency.
     * @param chartType
     *  One of 'sum', 'detailed', 'stacked', 'percent'.
     *
     * @returns {Array}
     *  An array of the data ordering as the type requested.
     */
    function getRows(collection, frequency, chartType, labelsUsed, labelsField, compareWith, compareLabelsField) {
      var values = {};
      var rows = [];
      var prevRateType;
      var isLineChart;
      var powerValueProperty = getPowerValueProperty(frequency);

      if (chartType == 'sum') {
        // Prepare data for a single graph, summing multiple meters to one column.
        // -----------------------------------------------------------------------

        // Create a temp array like { time: {low: 1, mid:4, peak:5}, time: {..}, ..}.
        isLineChart = ChartOptions.getChartType(frequency.type) == 'lineChart';

        angular.forEach(collection, function(item) {
          if (!(item.timestamp_rounded in values)) {
            // Never encountered this timestamp, create an empty object
            values[item.timestamp_rounded] = {};
          }
          // Save the average power. Sum the values.
          if (!values[item.timestamp_rounded][item.rate_type]) {
            values[item.timestamp_rounded][item.rate_type] = 0;
          }
          values[item.timestamp_rounded][item.rate_type] += +item[powerValueProperty];

          // Handle problem with line chart:
          // If having TOUse data, the lines should be elongated one data point forward
          // when changing rate-type in order to 'connect' the lines of the different
          // charts.
          if (isLineChart && prevRateType && prevRateType != item.rate_type) {
            if (!values[item.timestamp_rounded][prevRateType]) {
              values[item.timestamp_rounded][prevRateType] = 0;
            }
            // Will sum over different meters/sites/categories.
            values[item.timestamp_rounded][prevRateType] += +item[powerValueProperty];
          }

          prevRateType = item.rate_type;
        });

        // Display the unit according to selected frequency.
        var unit = ['hour', 'minute'].indexOf(frequency.frequency) != -1 ? 'קו״ט' : 'קוט״ש';

        // If 'compareCollection' is given, convert it to an indexed array.
        var compareWithIndexed = {};
        if (compareWith) {
          angular.forEach(compareWith, function (item) {
            compareWithIndexed[item.timestamp] = item;
          })
        }

        // Build rows
        angular.forEach(values, function(item, timestamp) {
          var label = moment.unix(timestamp).format(frequency.axis_h_format);
          var col = [{v: label}];
          ['flat', 'peak', 'mid', 'low'].forEach(function(type) {
            col.push({v: item[type], f: $filter('number')(item[type], 0) + ' ' + unit});
          });
          // Add compareWith column, if exists.
          if (compareWith) {
            var n = compareWithIndexed[timestamp] ? compareWithIndexed[timestamp][compareLabelsField] : undefined;
            col.push(n ? {v: n, f: $filter('number')(n, 0)} : {})
          }
          rows.push({ c: col, onSelect: timestamp });
        });
      }
      else if (chartType == 'detailed') {
        // Prepare data for a multiple graphs.
        // -----------------------------------------------------------------------

        angular.forEach(collection, function(item) {
          if (!(item.timestamp_rounded in values)) {
            // Never encountered this timestamp, create an empty object
            values[item.timestamp_rounded] = {};
          }
          if (labelsUsed.indexOf(+item[labelsField]) == -1) {
            // Never encountered this label. Save label in list.
            labelsUsed.push(+item[labelsField]);
          }
          if (!values[item.timestamp_rounded][item[labelsField]]) {
            // Never encountered this item, zero it out.
            values[item.timestamp_rounded][item[labelsField]] = 0;
          }
          // Will sum over rate-types.
          values[item.timestamp_rounded][item[labelsField]] += +item[powerValueProperty];
        });

        // Display the unit according to selected frequency.
        var unit = ['hour', 'minute'].indexOf(frequency.frequency) != -1 ? 'קו״ט' : 'קוט״ש';

        // Build rows
        angular.forEach(values, function(item, timestamp) {
          var label = moment.unix(timestamp).format(frequency.axis_h_format);
          var col = [{v: label}];
          labelsUsed.forEach(function(type) {
            col.push({v: item[type], f: $filter('number')(item[type], 0) + ' ' + unit});
          });
          // Add compareWith column, if exists.
          if (compareWith) {
            var n = compareWithIndexed[timestamp] ? compareWithIndexed[timestamp][compareLabelsField] : undefined;
            col.push(n ? {v: n, f: $filter('number')(n, 0)} : {})
          }
          rows.push({ 'c': col, onSelect: timestamp });
        });
      }

      return rows;
    }

    /**
     * Return the collection data in the type of the two chart type indicated.
     *
     * @param collection
     *  The collection to filter.
     * @param frequency
     *  The active frequency.
     * @param chartType
     *  One of 'sum', 'detailed', 'stacked', 'percent'.
     * @param labelsUsed
     *  An array of object ids that are used in the chart.
     * @param labels
     *  An indexed-array of id => object.
     *
     * @returns {Array}
     *  An array of the data ordering as the type requested.
     */
    function getColumns(collection, frequency, chartType, labelsUsed, labels, compareWith) {
      if (chartType == 'sum') {
        return [
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
            'id': 'temp',
            'label': 'טמפרטורה',
            'type': 'number',
          }
        ];
      }
      else if (chartType == 'detailed') {
        // First column is allways month
        var columns = [
          {
            'id': 'month',
            'label': 'Month',
            'type': 'string'
          }
        ];

        // Add meters/sites/categories columns
        labelsUsed.forEach(function(item) {
          columns.push({
            id: item,
            label: labels[item].label,
            type: 'number'
          })
        });

        if (compareWith) {
          column.push({
            'id': 'temp',
            'label': 'טמפרטורה',
            'type': 'number'
          })
        }
        return columns;
      }
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
