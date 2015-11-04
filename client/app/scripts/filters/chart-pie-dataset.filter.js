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
        legend: {position: 'top', maxLines: 5},
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
      var label;
      switch (collection.type) {
        case 'site_categories':
          label = 'קטגוריה';
          break;
        case 'sites':
          label = 'אתר';
          break;
        case 'meters':
          label = 'מונה';
          break;
      }

      // Prepare categories dataset.
      var data = {
        cols: [
          { label: label, type: 'string' },
          { label: 'קוט"ש', type: 'number' }
        ],
        'rows': getRows(collection.values, collection.type, labels)
      };

      return data;

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

      // DefualtLabel is a name for a label that is not found in labels array.
      var defaultLabel, selType;
      switch (type) {
        case 'site_categories':
          defaultLabel = 'Category ';
          selType = 'site_category';
          break;
        case 'sites':
          defaultLabel = 'Site ';
          selType = 'site';
          break;
        case 'meters':
          defaultLabel = 'Meter ';
          selType = 'meter';
          break;
      }

      // Fill result rows.
      angular.forEach(obj, function(value, key) {
        this.push({
          c: [
            { v: !Utils.isEmpty(labels) && labels[key] && labels[key].label || defaultLabel + key},
            // "f" is for formatting the value in the tooltip.
            { v: +value, f: $filter('number')(value, 0) + ' קוט״ש'},
            { id: key},
            { onSelect: {sel: selType, ids: key}}
          ]
        });
      }, rows);

      return rows;
    }

  });
