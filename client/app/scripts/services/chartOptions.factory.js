'use strict';

angular.module('negawattClientApp')
  .factory('ChartOptions', function ($stateParams, $window, Chart, moment) {
    var extend = angular.extend;

    var ChartOptions;

    ChartOptions = {
      getChartType: getChartType,
      getOptions: getOptions
    };

    /**
     * Get common configuration for draw Google Chart.
     *
     * @returns {*}
     */
    function getCommonOptions() {
      var w = angular.element($window),
        width = w.width(),
        height = w.height();

      var chartFrequencyActive = Chart.getActiveFrequency();

      return {
        height: '350',
        width: width * 7 / 12 - 150,
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
        'chart_type': 'LineChart'
      });
    }

    /**
     * Get configuration for a Google Line Chart with series.
     *
     * @returns {*}
     *  Configuration object.
     */
    function getLineCompareOptions() {
      var chartFrequencyActive = Chart.getActiveFrequency();

      return extend(getCommonOptions(), {
        chart_type: 'LineChart',
        'series': {
          0: {targetAxisIndex: 0},
          1: {targetAxisIndex: 0},
          2: {targetAxisIndex: 0},
          3: {targetAxisIndex: 0},
          4: {targetAxisIndex: 1}
        },
        'vAxes': {
          0: {
            title: chartFrequencyActive.axis_v_title,
            format: 'short',
          },
          1: {
            // @fixme: get title from somewhere.
            title: 'טמפרטורה',
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
    function getColumnCompareOptions(chartType) {
      // Build 'series' object.
      var numSeries = $stateParams.ids ? $stateParams.ids.split(',').length : 1;
      // If there's only one series, TOUse will be displayed, using 4 series.
      numSeries = (numSeries == 1) ? 4 : numSeries;
      var series = {};
      for (var i = 0; i < numSeries; i++) {
        series[i] = {targetAxisIndex: 0};
      }
      // Add a last series for temperature (if exists).
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
            // @fixme: get title from somewhere.
            title: 'טמפרטורה',
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
     * @param withSeries
     *  True if the chart will be organize in series.
     *
     * @returns {*}
     *  Chart options object.
     */
    function getOptions(frequency, chartType, withSeries) {
      switch (getChartType(frequency)) {
        case 'columnChart':
          return (withSeries) ? getColumnCompareOptions(chartType) : getColumnOptions(chartType);

        case 'lineChart':
          return (withSeries) ? getLineCompareOptions() : getLineOptions();
      }
    }

    return ChartOptions;
  });
