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
    return function (collection, chartType, compareWith, options, labels, labelsField, labelsPrefixLetter, compareLabelsField, oneItemSelected) {

      // chartType defaults to stacked.
      chartType = chartType ? chartType : 'stacked';
      // However, if there's only one item, revert to 'sum', that will display only one
      // meter/category, but split into TOUse rate-types.
      if ((chartType == 'detailed' || chartType == 'stacked') && oneItemSelected) {
        chartType = 'sum';
      }

      var chartFrequencyActive = Chart.getActiveFrequency();

      // Check if asked to return chart options only.
      if (collection == 'options-only') {
        return ChartOptions.getOptions(chartFrequencyActive, chartType, !!compareWith);
      }

      var data = getDataset(collection, chartFrequencyActive, chartType, labels, labelsField, labelsPrefixLetter, compareWith, compareLabelsField);
      options = ChartOptions.getOptions(chartFrequencyActive.type, chartType, data.numSeries, !!compareWith);


      // Recreate collection object.
      collection = {
        type: options.chart_type,
        data: data,
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
     * @param labelsPrefixLetter
     *  A prefix letter to add before the item-id as index into 'labels' collection.
     *
     * @returns {{cols: *[], rows: Array}}
     */
    function getDataset(collection, frequency, chartType, labels, labelsField, labelsPrefixLetter, compareWith, compareLabelsField) {
      var labelsUsed = [];
      var dataset = {
        // Add rows.
        rows: getRows(collection, frequency, chartType, labelsUsed, labels, labelsField, labelsPrefixLetter, compareWith, compareLabelsField),
        // Add columns.
        cols: getColumns(collection, frequency, chartType, labelsUsed, labels, labelsPrefixLetter, compareWith),
        // Number of series (might happen that a serie contains no data in 'collection').
        // For internal use, not used by google-charts.
        numSeries: labelsUsed.length
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
    function getRows(collection, frequency, chartType, labelsUsed, labels, labelsField, labelsPrefixLetter, compareWith, compareLabelsField) {
      var values = {};
      var rows = [];
      var prevRateType;
      var isLineChart;
      var powerValueProperty = getPowerValueProperty(frequency);

      // If 'sensorData' is given, convert it to an indexed array.
      var compareWithIndexed = {};
      if (compareWith) {
        angular.forEach(compareWith, function (item) {
          compareWithIndexed[item.timestamp_rounded] = item;
        })
      }

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

        // Build rows
        angular.forEach(values, function(item, timestamp) {
          var time = moment.unix(timestamp).toDate();
          var label = moment.unix(timestamp).format(frequency.tooltip_format);
          var col = [{v: time}];
          ['flat', 'peak', 'mid', 'low'].forEach(function(type) {
            var value = item[type];
            col.push({v: value});
            col.push(value ? {v: label + '\n' + $filter('number')(item[type], 0) + ' ' + unit} : {});
          });
          // Add compareWith column, if exists.
          if (compareWith) {
            var n = compareWithIndexed[timestamp] ? compareWithIndexed[timestamp][compareLabelsField] : undefined;
            col.push(n ? {v: n} : {});
            col.push(n ? {v: label + '\n' + $filter('number')(n, 0) + ' מעלות'} : {})
          }
          rows.push({ c: col, onSelect: timestamp });
        });

        // For sum chart there's only one label.
        labelsUsed.push(labels);
      }
      else if (chartType == 'detailed' || chartType == 'stacked') {
        // Prepare data for a multiple graphs.
        // -----------------------------------------------------------------------

        angular.forEach(collection, function(item) {
          var itemLabel = labels[labelsPrefixLetter + item[labelsField]];
          if (!(item.timestamp_rounded in values)) {
            // Never encountered this timestamp, create an empty object
            values[item.timestamp_rounded] = {};
          }
          if (labelsUsed.indexOf(itemLabel) == -1) {
            // Never encountered this label. Save label in list.
            labelsUsed.push(itemLabel);
          }
          if (!values[item.timestamp_rounded][itemLabel.id]) {
            // Never encountered this item, zero it out.
            values[item.timestamp_rounded][itemLabel.id] = 0;
          }
          // Will sum over rate-types.
          values[item.timestamp_rounded][itemLabel.id] += +item[powerValueProperty];
        });

        // Display the unit according to selected frequency.
        var unit = ['hour', 'minute'].indexOf(frequency.frequency) != -1 ? 'קו״ט' : 'קוט״ש';

        // Build rows
        angular.forEach(values, function(item, timestamp) {
          var time = moment.unix(timestamp).toDate();
          var label = moment.unix(timestamp).format(frequency.tooltip_format);
          var col = [{v: time}];
          labelsUsed.forEach(function(type) {
            var value = item[type.id];
            col.push({v: value});
            col.push(value ? {v: label + '\n' + $filter('number')(item[type.id], 0) + ' ' + unit} : {});
          });
          // Add compareWith column, if exists.
          if (compareWith) {
            var n = compareWithIndexed[timestamp] ? compareWithIndexed[timestamp][compareLabelsField] : undefined;
            col.push(n ? {v: n} : {});
            col.push(n ? {v: label + '\n' + $filter('number')(n, 0) + ' מעלות'} : {})
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
    function getColumns(collection, frequency, chartType, labelsUsed, labels, labelsPrefixLetter, compareWith) {
      if (chartType == 'sum') {
        var columns = [
          {
            'id': 'month',
            'label': 'Month',
            'type': 'date',
          },
          {
            'id': 'flat',
            'label': 'אחיד',
            'type': 'number',
          },
          {
            'id': 'flat',
            'type': 'string',
            p: {role: 'tooltip'}
          },
          {
            'id': 'peak',
            'label': 'פסגה',
            'type': 'number',
          },
          {
            'id': 'peak',
            'type': 'string',
            p: {role: 'tooltip'}
          },
          {
            'id': 'mid',
            'label': 'גבע',
            'type': 'number',
          },
          {
            'id': 'mid',
            'type': 'string',
            p: {role: 'tooltip'}
          },
          {
            'id': 'low',
            'label': 'שפל',
            'type': 'number',
          },
          {
            'id': 'low',
            'type': 'string',
            p: {role: 'tooltip'}
          }
          ];
        if (compareWith) {
          // @fixme: put proper label here, in stead of hard coded temperature.
          columns.push({
              'id': 'temp',
              'label': 'טמפרטורה',
              'type': 'number',
            },
            {
              'id': 'temp',
              'type': 'string',
              p: {role: 'tooltip'}
            });
        }
        return columns;
      }
      else if (chartType == 'detailed' || chartType == 'stacked') {
        // First column is always month
        var columns = [
          {
            'id': 'month',
            'label': 'Month',
            'type': 'date'
          }
        ];

        // Add meters/sites/categories columns
        // For each data set add two columns - one for the data and one for the tooltip.
        labelsUsed.forEach(function(item) {
          columns.push({
              id: item.id,
              label: labels[labelsPrefixLetter + item.id].name,
              type: 'number'
            },
            {
              'id': item.id,
              'type': 'string',
              p: {role: 'tooltip'}
            })
        });

        if (compareWith) {
          columns.push({
              'id': 'temp',
              'label': 'טמפרטורה',
              'type': 'number'
            },
            {
              'id': 'temp',
              'type': 'string',
              p: {role: 'tooltip'}
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
