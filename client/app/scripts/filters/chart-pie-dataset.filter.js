angular.module('negawattClientApp')
  .filter('toPieChartDataset', function (Utils, $filter) {

    /**
     * From a collection object create a Google Chart data for a Pie object
     *
     * @param collection
     *  Object where get the data to generate the chart data
     * @param labels
     *  Object to get the labels, could be meters or category data.
     *
     * @returns {*}
     *  The dataset collection filtered.
     */
    return function (collection, labels){
      // Recreate collection object.
      collection = {
        type: 'PieChart',
        data: getDataset(collection, labels),
        options: getOptions(collection.type)
      }
      return collection;
    }

    /**
     * Return the options of the selected chart.
     *
     * @returns {*}
     *  Chart options object.
     */
    function getOptions(type) {
      return {
        title: 'Kws per ' + type,
        pieSliceText: 'label'
      };
    }

    /**
     * Return the object with the dataset based on the collection object.
     *
     * @param collection
     *  The collection data.
     * @param labels
     *  The object with the labels.
     *
     */
    function getDataset(collection, labels) {
      var dataset = {
        'cols': [
          {id: 't', label: 'Categories', type: 'string'},
          {id: 's', label: 'Slices', type: 'number'}
        ],
        'rows': getRows(collection.values, collection.type, labels)
      };

      return dataset;
    };

    /**
     * Return the collection in dataset Pie chart google format. According to
     * the type.
     *
     * @param obj
     *  The collection to filter.
     * @param type
     *  The type of the data (category|meter).
     *
     * @returns {Array}
     *  An array of the data ordering as the type requested.
     */
    function getRows(obj, type, labels) {
      var rows = [];

      // Transform to Google Pie Chart compatible.
      switch (type) {
        case 'category':
          angular.forEach(obj, function(value, key) {
            this.push({
              c: [
                {v: !Utils.isEmpty(labels) && labels[key].label || 'category ' + key},
                {v: value},
                {id: key}
              ]
            });
          }, rows);
          break;
        case 'meter':
          angular.forEach(obj, function(value, key) {
            this.push({
              c: [
                {v: !Utils.isEmpty(labels) && labels[key].contract || 'meter ' + key},
                {v: value},
                {id: key}
              ]
            });
          }, rows);
          break;
      }

      return rows;
    }

  });
