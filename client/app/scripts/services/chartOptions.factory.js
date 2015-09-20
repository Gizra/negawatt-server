'use strict';

angular.module('negawattClientApp')
  .factory('ChartOptions', function ($window, Chart) {
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
        legend: { position: 'bottom' },
        backgroundColor: 'none',
        vAxis: {
          title: chartFrequencyActive.axis_v_title,
          format: 'short',
          gridlines: {
            count: 3
          }
        },
        hAxis: {
          // No title in order to have enough space for the bars labels.
        },
        tooltip: {isHtml: true}
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
      return extend(getCommonOptions(), {
        chart_type: 'LineChart',
        'series': {
          0: {targetAxisIndex: 0},
          1: {targetAxisIndex: 0},
          2: {targetAxisIndex: 0},
          3: {targetAxisIndex: 0},
          4: {targetAxisIndex: 1}
        }
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
      var chartFrequencyActive = Chart.getActiveFrequency();
      return extend(getCommonOptions(), {
        'chart_type': 'ColumnChart',
        'isStacked': getStackOptions(chartType),
        'fill': 20,
        'displayExactValues': true,
        'series': {
          0: {targetAxisIndex: 0},
          1: {targetAxisIndex: 0},
          2: {targetAxisIndex: 0},
          3: {targetAxisIndex: 0},
          4: {
            targetAxisIndex: 1,
            type: 'line'
          }
        },
        'vAxes': {
          0: {
            title: chartFrequencyActive.axis_v_title,
            format: 'short',
            'gridlines': {
              'count': 6
            }
          },
          1: {
            title: 'טמפרטורה',
            format: 'short',
            'gridlines': {
              'count': 6
            },
            'chart_type': 'LineChart'
          }
        },
        'hAxis': {
          'title': 'Set a title hAxis'
        }
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
