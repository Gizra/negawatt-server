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
      };
      return collection;
    };

    /**
     * Return the options of the selected chart.
     *
     * @returns {*}
     *  Chart options object.
     */
    function getOptions(type) {
      return {
        //title: 'Kws per ' + type,
        pieSliceText: 'label',
        tooltip: {isHtml: true},
        legend: {position: 'none'},
        backgroundColor: 'none'
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
      if (collection.type == 'site_categories') {
        // Prepare categories dataset.
        data = {
          cols: [
            {
              label: 'קטגוריה', // collection.type
              type: 'string'
            },
            {
              label: 'קוט"ש',
              type: 'number'
            }
          ],
          'rows': getRows(collection.values, collection.type, labels)
        };

        return data;
      }
      else {
        // type == meters
      }
      return {};

    }

    /**
     * Return the collection in dataset Pie chart google format. According to
     * the type.
     *
     * @param obj
     *  The collection to filter.
     * @param type
     *  The type of the data (site_categories|meters).
     * @param labels
     *  Array of labels.
     *
     * @returns {Array}
     *  An array of the data ordering as the type requested.
     */
    function getRows(obj, type, labels) {
      var rows = [];

      // Transform to Google Pie Chart compatible.
      switch (type) {
        case 'site_categories':
          angular.forEach(obj, function(value, key) {
            this.push({
              c: [
                { v: !Utils.isEmpty(labels) && labels[key].label || 'Category ' + key},
                // "f" is for formatting the value in the tooltip.
                { v: +value, f: $filter('number')(value, 0) + ' קוט״ש'},
                { id: key}
              ]
            });
          }, rows);
          break;
        case 'meters':
          angular.forEach(obj, function(value, key) {
            this.push({
              c: [
                { v: !Utils.isEmpty(labels) && labels[key].contract || 'Meter ' + key},
                { v: +value, f: $filter('number')(value, 0) + ' קוט״ש'},
                { id: key}
              ]
            });
          }, rows);
          break;
      }

      return rows;
    }

  });
