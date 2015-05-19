angular.module('negawattClientApp')
  .filter('toChartDataset', function () {

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
    return function (collection, chartType){
      if (!validate(chartType)) {
        return;
      }

      // Contruc
      collection = {
        type: chartType,
        data: getDataset(collection)
      }
      console.log(collection, data);
      return collection;
    }

    /**
     * Validate the chart type pass to the filter.
     *
     * @param chartType
     *  Indicate the type of chart, exmaple: 'LineChart'.
     */
    function validate(chartType) {
      var values = ['Linechart', 'PieChart'];

      return values.indexOf(chartType) !== -1;
    }

    /**
     * Return the object with the dataset based on the collection object.
     *
     * @param collection
     *  The collection to format.
     */
    function getDataset(collection) {
      var dataset = {
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

      return dataset;
    }

  });
