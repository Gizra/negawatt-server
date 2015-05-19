angular.module('negawattClientApp')
  .filter('toChartDataset', function (Chart) {

    /**
     * From a collection object create a Google Chart data ser object
     * according the type.
     *
     * @param collection
     *  The collection to format.
     * @param chartType {String}
     *  Indicate the type of chart, exmaple: 'LineChart'.
     *
     * @returns {*}
     *  The dataset collection filtered.
     */
    return function (collection, chartType, options){
      if (!validate(chartType)) {
        return;
      }

      // Recreate collection object.
      collection = {
        type: chartType,
        data: getDataset(collection),
        options: getOptions()
      }
      console.log(collection);
      return collection;
    }

    /**
     * Validate the chart type pass to the filter.
     *
     * @param chartType
     *  Indicate the type of chart, exmaple: 'LineChart'.
     */
    function validate(chartType) {
      // Valid type of chart.
      var values = ['LineChart', 'PieChart'];

      return values.indexOf(chartType) !== -1;
    }

    /**
     * Return the options of the selected chart.
     */
    function getOptions() {
      var chart = Chart.getActiveFrequency();
      return {
        'isStacked': 'true',
        'bar': { groupWidth: '75%' },
        'fill': 20,
        'displayExactValues': true,
        'vAxis': {
          'title': chart.axis_v_title,
          'gridlines': {
            'count': 7
          }
        },
        'hAxis': {
          'title': chart.axis_h_title 
        }
      }
    }

    /**
     * Return the object with the dataset based on the collection object.
     *
     * @param collection
     *  The collection to format.
     */
    function getDataset(collection) {
      var dataset = {
        // Add columns.
        "cols": [
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
          }
        ]
      };

      // Add rows.

      return dataset;
    }

  });
