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
        pieSliceText: 'label',
        tooltip: {isHtml: true}
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
          {id: 't', label: collection.type, type: 'string'},
          {id: 's', label: 'Kws', type: 'number'},
          {id: '', role: 'tooltip', type: 'string', p: {role: 'tooltip', html: true}}
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
                {v: +value},
                //{id: key},
                {
                  v: " <b>Shipping 2</b><br /><img src=\"http://icons.iconarchive.com/icons/antrepo/container-4-cargo-vans/512/Google-Shipping-Box-icon.png\" style=\"height:85px\" />",
                  p: {}
                }
              ]
            });
          }, rows);

          break;
        case 'meter':
          angular.forEach(obj, function(value, key) {
            this.push({
              c: [
                {v: !Utils.isEmpty(labels) && labels[key].contract || 'meter ' + key},
                {v: +value},
                {id: key}
              ]
            });
          }, rows);
          break;
      }
      console.log(rows);
      return rows;
    }

  });
