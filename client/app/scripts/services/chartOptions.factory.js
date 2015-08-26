'use strict';

angular.module('negawattClientApp')
  .factory('ChartOptions', function ($window, Chart) {
    var extend = angular.extend;

    var ChartOptions;

    ChartOptions = {
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
        'height': '350',
        'width': width * 7 / 12 - 150,
        titlePosition: 'none',
        legend: { position: 'bottom' },
        backgroundColor: 'none',
        'vAxis': {
          'title': chartFrequencyActive.axis_v_title,
          'gridlines': {
            'count': 3
          }
        },
        'hAxis': {
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
        'chart_type': 'LineChart'
      });
    }

    /**
     * Get configuration for a Google Coloumn Chart.
     *
     * @returns {*}
     *  Configuration object.
     */
    function getColumnOptions() {
      return extend(getCommonOptions(), {
        'chart_type': 'ColumnChart',
        'isStacked': 'true',
        'fill': 20,
        'displayExactValues': true,
        'bar': { groupWidth: '75%' }
      });
    }

    /**
     * Get configuration for a Google Column Chart with series.
     *
     * @returns {*}
     *  Configuration object.
     */
    function getColumnCompareOptions() {
      return extend(getCommonOptions(), {
        'chart_type': 'ColumnChart',
        'isStacked': 'true',
        'fill': 20,
        'displayExactValues': true,
        'series': {
          0: {targetAxisIndex: 0},
          1: {
            targetAxisIndex: 1,
            type: 'line'
          }
        },
        'vAxes': {
          0: {
            'title': 'Set a title vAxis (Ex. Electricity)',
            'gridlines': {
              'count': 6
            }
          },
          1: {
            'title': 'Set a title vAxis (Ex. Temperature)',
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

    /**
     * Return the options of the selected chart.
     *
     * @param frequency
     *  The frequency number (Ex. year:1, month:2 .... minute:5).
     * @param withSeries
     *  True if the chart will be organize in series.
     *
     * @returns {*}
     *  Chart options object.
     */
    function getOptions(frequency, withSeries) {
      var options;

      if (angular.isString(frequency)) {
        frequency = +frequency;
      }

      switch (frequency) {
        case 1:
        case 2:
        case 3:
          options = (withSeries) ? getColumnCompareOptions() : getColumnOptions();
          break;
        case 4:
        // Temporal test
        //case 2:
        case 5:
          options = (withSeries) ? getLineCompareOptions() : getLineOptions();
          break;
      }

      return options;
    }

    return ChartOptions;
  });
