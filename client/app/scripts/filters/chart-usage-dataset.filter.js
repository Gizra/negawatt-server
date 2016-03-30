'use strict';

angular.module('negawattClientApp')
  .filter('toChartDataset', function ($filter, Chart, ChartOptions, moment) {

    /**
     * From a collection object create a Google Chart data ser object
     * according the type.
     *
     * @param electricityData {array}
     *  The electricityData of electricity data to format.
     * @param chartType {string}
     *  One of 'sum', 'detailed', 'stacked', 'percent'.
     *   sum: sum several meters to one column.
     *   detailed: display different meters side-be-side.
     *   stacked: stack meters to one column.
     *   percent: stack and stretch so all columns are the same height.
     * @param sensorsData {array}
     *  An array of sensors' data.
     * @param metersAndSensors {object}
     *  An indexed-array of meters/sensors tree, containing all the information
     *  about site-categories, sites, meters and sensors.
     * @param labelsField {string}
     *  The name of the field in 'electricityData' that holds the value to show.
     * @param labelsPrefixLetter {string}
     *  The prefix-letter to add to the meter id in order to find in in
     *  'metersAndSensors' array.
     * @param sensorsLabelsField {string}
     *  The name of the field in 'sensorsData' that holds the value to show.
     * @param sensorsDescriptors {object}
     *  An array of objects containing information about sensor types, e.g.
     *  what they measure, in what units, etc.
     * @param oneItemSelected {boolean}
     *  True if only one electricity meter selected.
     *
     * @returns {object}
     *  The dataset collection filtered.
     */
    return function (electricityData, chartType, sensorsData, metersAndSensors, labelsField, labelsPrefixLetter, sensorsLabelsField, sensorsDescriptors, oneItemSelected) {

      // chartType defaults to stacked.
      chartType = chartType ? chartType : 'stacked';
      // However, if there's only one item, revert to 'sum', that will display only one
      // meter/category, but split into TOUse rate-types.
      if ((chartType == 'detailed' || chartType == 'stacked') && oneItemSelected) {
        chartType = 'sum';
      }

      // Figure out sensor's units.
      // Taken from the first sensor data.
      // FIXME: How to handle multiple sensors with different units?
      var type = sensorsData.length ? sensorsData[0].sensor_type : null;
      var sensorUnits = type ? ('[' + sensorsDescriptors[type].units + '] ' + sensorsDescriptors[type].label) : null;

      var chartFrequencyActive = Chart.getActiveFrequency();
      var data = getDataset(electricityData, chartFrequencyActive, chartType, metersAndSensors, labelsField, labelsPrefixLetter, sensorsData, sensorsLabelsField, sensorsDescriptors);
      var options = ChartOptions.getOptions(chartFrequencyActive.type, chartType, data.numSeries, data.numSensors, sensorUnits);

      // Create collection object for charts engine.
      return {
        type: options.chart_type,
        data: data,
        options: options
      };
    };

    /**
     * Return the object with the dataset based on the electricityData object.
     *
     * @param electricityData
     *  The electricityData to format.
     * @param frequency
     *  The active frequency.
     * @param chartType
     *  One of 'sum', 'detailed', 'stacked', 'percent'.
     * @param metersAndSensors
     *  An indexed-array id => object.
     * @param labelsField {string}
     *  The name of the field in 'electricityData' that holds the value to show.
     * @param labelsPrefixLetter
     *  A prefix letter to add before the item-id as index into 'metersAndSensors' collection.
     * @param sensorsData {array}
     *  An array of sensors' data.
     * @param sensorsLabelsField {string}
     *  The name of the field in 'sensorsData' that holds the value to show.
     * @param sensorsDescriptors {object}
     *  An array of objects containing information about sensor types, e.g.
     *  what they measure, in what units, etc.
     *
     * @returns {{cols: *[], rows: Array}}
     */
    function getDataset(electricityData, frequency, chartType, metersAndSensors, labelsField, labelsPrefixLetter, sensorsData, sensorsLabelsField, sensorsDescriptors) {
      var labelsUsed = [],
        sensorsUsed = [];
      var dataset = {
        // Add rows.
        rows: getRows(electricityData, frequency, chartType, labelsUsed, metersAndSensors, labelsField, labelsPrefixLetter, sensorsData, sensorsLabelsField, sensorsUsed, sensorsDescriptors),
        // Add columns.
        cols: getColumns(frequency, chartType, labelsUsed, metersAndSensors, labelsPrefixLetter, sensorsUsed),
        // Number of series (might happen that a series contains no data in 'electricityData').
        // For internal use, not used by google-charts.
        numSeries: labelsUsed.length,
        numSensors: sensorsUsed.length
      };

      return dataset;
    }

    /**
     * Return the collection data in the type of the two chart type indicated.
     *
     * @param electricityData
     *  The electricityData to filter.
     * @param frequency
     *  The active frequency.
     * @param chartType
     *  One of 'sum', 'detailed', 'stacked', 'percent'.
     * @param labelsUsed
     *  RETURNED array of meters' labels used when rows were filled.
     * @param metersAndSensors
     *  An indexed-array id => object.
     * @param labelsField {string}
     *  The name of the field in 'electricityData' that holds the value to show.
     * @param labelsPrefixLetter
     *  A prefix letter to add before the item-id as index into 'metersAndSensors' collection.
     * @param sensorsData {array}
     *  An array of sensors' data.
     * @param sensorsLabelsField {string}
     *  The name of the field in 'sensorsData' that holds the value to show.
     * @param sensorsUsed
     *  RETURNED array of sensor-objects used when rows were filled.
     * @param sensorsDescriptors {object}
     *  An array of objects containing information about sensor types, e.g.
     *  what they measure, in what units, etc.
     *
     * @returns {Array}
     *  An array of the data ordering as the type requested.
     */
    function getRows(electricityData, frequency, chartType, labelsUsed, metersAndSensors, labelsField, labelsPrefixLetter, sensorsData, sensorsLabelsField, sensorsUsed, sensorsDescriptors) {
      var values = {};
      var rows = [];
      var isLineChart;
      var powerValueProperty = getPowerValueProperty(frequency);

      // If 'sensorData' is given, convert it to an indexed array of
      // the form sensorsDataIndexed[id][timestamp] = data-record.
      var sensorsDataIndexed = {};
      if (sensorsData.length) {
        angular.forEach(sensorsData, function (item) {
          // If this sensor id is not known yet, open a new row.
          if (!sensorsDataIndexed[item.sensor]) {
            sensorsDataIndexed[item.sensor] = {};
            // Also add sensor-type record to the sensors-used array.
            sensorsUsed.push(sensorsDescriptors[item.sensor_type]);
          }
          sensorsDataIndexed[item.sensor][item.timestamp_rounded] = item;
        })
      }

      if (chartType == 'sum') {
        // Prepare data for a single graph, summing multiple meters to one column.
        // -----------------------------------------------------------------------

        // Create a temp array like { time: {low: 1, mid:4, peak:5}, time: {..}, ..}.
        isLineChart = ChartOptions.getChartType(frequency.type) == 'lineChart';

        var blankRow = {
          flat: null,
          peak: null,
          mid: null,
          low: null
        };
        angular.forEach(electricityData, function(item) {
          if (!(item.timestamp_rounded in values)) {
            // Never encountered this timestamp, create an empty row object
            values[item.timestamp_rounded] = angular.copy(blankRow);
          }
          // Save the average power. Sum the values.
          values[item.timestamp_rounded][item.rate_type] += +item[powerValueProperty];
        });

        // Display the unit according to selected frequency.
        var unit = frequency.tooltip_units;
        var colors = {flat: 'blue', peak: 'red', mid: 'orange', low: 'green'};

        // Build rows
        angular.forEach(values, function(item, timestamp) {
          var time = moment.unix(timestamp).toDate();
          var label = moment.unix(timestamp).format(frequency.tooltip_format);
          var col = [{v: time}];
          ['flat', 'peak', 'mid', 'low'].forEach(function(type) {
            var value = item[type];
            if (isLineChart) {
              // Line chart with varying colors. Push the value, then tooltip, then color
              // information, and then 3 more empty charts.
              if (value) {
                col.push({v: value});
                col.push(value ? {v: label + '\n' + $filter('number')(item[type], 0) + ' ' + unit} : {});
                col.push({v: 'color:' + colors[type]});
                col.push({v: null});
                col.push({v: null});
                col.push({v: null});
              }
            }
            else {
              // Stacked columns chart, just add the values for 4 charts.
              col.push({v: value});
              col.push(value ? {v: label + '\n' + $filter('number')(item[type], 0) + ' ' + unit} : {});
            }
          });
          // Add sensorsData column, if exists.
          if (sensorsData.length) {
            angular.forEach(sensorsDataIndexed, function(item) {
              var n = item[timestamp] ? item[timestamp][sensorsLabelsField] : undefined,
                units = n ? sensorsDescriptors[item[timestamp].sensor_type].units : '';
              col.push(n ? {v: n} : {});
              col.push(n ? {v: label + '\n' + $filter('number')(n, 0) + ' ' + units} : {})
            })
          }
          rows.push({ c: col, onSelect: timestamp });
        });

        // For sum chart there's only one label.
        labelsUsed.push(metersAndSensors);
      }
      else if (chartType == 'detailed' || chartType == 'stacked') {
        // Prepare data for a multiple graphs.
        // -----------------------------------------------------------------------

        angular.forEach(electricityData, function(item) {
          var itemLabel = metersAndSensors[labelsPrefixLetter + item[labelsField]];
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
        var unit = frequency.tooltip_units;

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
          // Add sensorsData column, if exists.
          if (sensorsData.length) {
            angular.forEach(sensorsDataIndexed, function(item) {
              var n = item[timestamp] ? item[timestamp][sensorsLabelsField] : undefined,
                units = n ? sensorsDescriptors[item[timestamp].sensor_type].units : '';
              col.push(n ? {v: n} : {});
              col.push(n ? {v: label + '\n' + $filter('number')(n, 0) + ' ' + units} : {})
            })
          }
          rows.push({ 'c': col, onSelect: timestamp });
        });
      }

      return rows;
    }

    /**
     * Return the collection data in the type of the two chart type indicated.
     *
     * @param frequency
     *  The active frequency.
     * @param chartType
     *  One of 'sum', 'detailed', 'stacked', 'percent'.
     * @param labelsUsed
     *  An array of object ids that were used when rows were filled.
     * @param metersAndSensors
     *  An indexed-array of id => object.
     * @param labelsPrefixLetter
     *  A prefix letter to add before the item-id as index into 'metersAndSensors' collection.
     * @param sensorsUsed
     *  Array of sensor-objects used when rows were filled.
     *
     * @returns {Array}
     *  An array of the data ordering as the type requested.
     */
    function getColumns(frequency, chartType, labelsUsed, metersAndSensors, labelsPrefixLetter, sensorsUsed) {
      if (chartType == 'sum') {
        var columns;
        if (frequency.type < 4) {
          // For year, month and week frequency, show stacked 4 charts for peak,
          // mid, low and flat, each with its own tooltip.
          columns = [
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
        }
        else {
          // For hour and minute frequencies, show 1 charts with different colors
          // for peak, mid, low, and flat sections. The other charts are fake,
          // only so that they appear in the legend.
          columns = [
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
              'id': 'flat',
              'type': 'string',
              p: {role: 'style'}
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
          ];
        }
      }
      else if (chartType == 'detailed' || chartType == 'stacked') {
        // First column is always month
        columns = [
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
              label: metersAndSensors[labelsPrefixLetter + item.id].name,
              type: 'number'
            },
            {
              'id': item.id,
              'type': 'string',
              p: {role: 'tooltip'}
            })
        });
      }

      // Add sensors, as listed in sensorsUsed array.
      angular.forEach(sensorsUsed, function(sensorType) {
        columns.push({
            'id': sensorType.id,
            'label': sensorType.label,
            'type': 'number'
          },
          {
            'id': sensorType.id,
            'type': 'string',
            p: {role: 'tooltip'}
          });
      });
      return columns;
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
