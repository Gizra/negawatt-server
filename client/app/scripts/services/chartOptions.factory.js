'use strict';

angular.module('negawattClientApp')
  .factory('ChartOptions', function ($stateParams, $window, Chart, moment) {
    var extend = angular.extend;

    var ChartOptions;

    ChartOptions = {
      getChartType: getChartType,
      getOptions: getOptions,
      getChartWidth: getChartWidth
    };

    function getChartWidth() {
      var w = angular.element($window),
        width = w.width();

      return width * 7 / 12 - 150;
    }

    /**
     * Get common configuration for draw Google Chart.
     *
     * @returns {*}
     */
    function getCommonOptions() {
      var chartFrequencyActive = Chart.getActiveFrequency();

      return {
        height: '350',
        width: getChartWidth(),
        titlePosition: 'none',
        legend: {
          maxLines: 3,
          position: 'top'
        },
        backgroundColor: 'none',
        vAxis: {
          title: chartFrequencyActive.axis_v_title,
          format: 'short',
          gridlines: {count: 5}
        },
        hAxis: {
          // No title in order to have enough space for the bars labels.
          minValue: moment.unix($stateParams.chartPreviousPeriod).toDate(),
          maxValue: moment.unix($stateParams.chartNextPeriod - 1).toDate(),
          format: chartFrequencyActive.axis_h_format
        },
        tooltip: {isHtml: true},
        crosshair: {
          trigger: 'both',
          orientation: 'vertical'
        }
      }
    }

    /**
     * Get configuration for a Google Line Chart.
     *
     * @returns {*}
     *  Configuration object.
     */
    function getLineOptions() {
      return extend(getCommonOptions(), {
        'chart_type': 'LineChart',
        interpolateNulls: true
      });
    }

    /**
     * Get configuration for a Google Line Chart with series.
     *
     * @returns {*}
     *  Configuration object.
     */
    function getLineCompareOptions(numSeries, sensorUnits) {
      // If there's only one serie, TOUse will be displayed, using 4 series.
      numSeries = (numSeries == 1) ? 4 : numSeries;
      var series = {};
      for (var i = 0; i < numSeries; i++) {
        series[i] = {targetAxisIndex: 0};
      }
      // Add a last series for temperature (if exists).
      series[numSeries] = {targetAxisIndex: 1};

      var chartFrequencyActive = Chart.getActiveFrequency();

      return extend(getCommonOptions(), {
        chart_type: 'LineChart',
        interpolateNulls: true,
        'series': series,
        'vAxes': {
          0: {
            title: chartFrequencyActive.axis_v_title,
            format: 'short',
          },
          1: {
            // @fixme: get title from somewhere.
            title: sensorUnits,
            format: 'short',
          }
        },
      });
    }

    /**
     * Get stack option based on chart type.
     *
     * @param chartType
     *  One of 'sum', 'detailed', 'stacked', 'percent'.
     *
     * @returns {string|boolean}
     *  Stack option.
     */
    function getStackOptions(chartType) {
      // chartType defaults to sum.
      chartType = chartType ? chartType : 'sum';

      switch (chartType) {
        case 'sum':
        case 'stacked':
          return true;
        case 'percent':
          return 'percent';
        default:
          return false;
      }
    }

    /**
     * Get configuration for a Google Coloumn Chart.
     *
     * @param chartType
     *  One of 'sum', 'detailed', 'stacked', 'percent'.
     *
     * @returns {*}
     *  Configuration object.
     */
    function getColumnOptions(chartType) {
      return extend(getCommonOptions(), {
        'chart_type': 'ColumnChart',
        'isStacked': getStackOptions(chartType),
        'fill': 20,
        'displayExactValues': true,
        'bar': { groupWidth: '75%' }
      });
    }

    /**
     * Get configuration for a Google Column Chart with series.
     *
     * @param chartType
     *  One of 'sum', 'detailed', 'stacked', 'percent'.
     *
     * @returns {*}
     *  Configuration object.
     */
    function getColumnCompareOptions(chartType, numSeries, sensorUnits) {
      // If there's only one series, TOUse will be displayed, using 4 series.
      numSeries = (numSeries == 1) ? 4 : numSeries;
      var series = {};
      for (var i = 0; i < numSeries; i++) {
        series[i] = {targetAxisIndex: 0};
      }
      // Add a last series for sensor (if exists).
      series[numSeries] = {
        targetAxisIndex: 1,
          type: 'line'
      };

      var chartFrequencyActive = Chart.getActiveFrequency();
      return extend(getCommonOptions(), {
        'chart_type': 'ColumnChart',
        'isStacked': getStackOptions(chartType),
        'fill': 20,
        'displayExactValues': true,
        'series': series,
        'vAxes': {
          0: {
            title: chartFrequencyActive.axis_v_title,
            format: 'short',
          },
          1: {
            title: sensorUnits,
            format: 'short',
            'chart_type': 'LineChart'
          }
        },
      });
    }

    function getChartType(frequency) {
      switch (+frequency) {
        case 1:
        case 2:
        case 3:
          return 'columnChart';
        case 4:
        case 5:
          return 'lineChart';
      }
    }

    /**
     * Return the options of the selected chart.
     *
     * @param frequency
     *  The frequency number (Ex. year:1, month:2 .... minute:5).
     * @param chartType
     *  One of 'sum', 'detailed', 'stacked', 'percent'.
     * @param numSeries
     *  The number of series that has data (it might happen that a serie will not contain any data, hence will not
     *  appear in the data collection returned from the server).
     * @param withCompare
     *  True if the chart will have a comparison series (e.g. temperature).
     *
     * @returns {*}
     *  Chart options object.
     */
    function getOptions(frequency, chartType, numSeries, withCompare, sensorUnits) {
      switch (getChartType(frequency)) {
        case 'columnChart':
          return withCompare ? getColumnCompareOptions(chartType, numSeries, sensorUnits) : getColumnOptions(chartType);

        case 'lineChart':
          return withCompare ? getLineCompareOptions(numSeries, sensorUnits) : getLineOptions();
      }
    }

    return ChartOptions;
  });
