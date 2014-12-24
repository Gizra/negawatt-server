'use strict';

angular.module('negawattClientApp')
  .service('ChartCategories', function ($q, $filter, Category, Utils) {

    /**
     * Get the chart data and plot.
     *
     * @returns {$q.promise}
     */
    this.get = function() {
      var deferred = $q.defer();

      Category.get().then(function(categories) {
        deferred.resolve(transformDataToDatasets(categories.collection));
      });

      return deferred.promise;
    };

    /**
     * Transform categories collection to Google Pie Chart object format.
     *
     * @param {*} categories
     *   The categories collection.
     * @param {Number} depth
     *   Number indicate the relation parent-children between categories.
     *
     * @returns {*}
     *   Return categories collection for a depth, in the Google Pie Chart format.
     **/
    function transformDataToDatasets(categories, depth) {
      if (angular.isUndefined(depth)) {
        depth = 0;
      }
      // Type of chart.
      categories.type = 'PieChart';
      // Data chart.
      categories.data = {
        'cols': [
          {id: 't', label: 'Categories', type: 'string'},
          {id: 's', label: 'Slices', type: 'number'}
        ],
        'rows': getRows(categories, depth)
      };

      return categories;
    }

    /**
     * Return categories collection of a specific depth.
     *
     * @param categories
     *    The category collection.
     * @param depth
     *    Number indicate the relation parent-children between categories.
     *
     * @returns {*}
     *    The collection data in Google Pie Chart format.
     */
    function getRows(categories, depth) {
      var rows = [];

      // Apply filter.
      categories = $filter('filter')(Utils.toArray(categories), function(category) {
        if (category.meters > 0 && category.depth === depth) {
          return category;
        }
      });

      // Transform to Google Pie Chart compatible.
      angular.forEach(categories, function(row) {
        this.push({
          c: [
            {v: row.label},
            {v: row.meters}
          ]
        });
      }, rows);

      return rows
    }

  });
