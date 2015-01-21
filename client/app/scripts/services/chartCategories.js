'use strict';

angular.module('negawattClientApp')
  .service('ChartCategories', function ($q, $filter, Category, Utils) {

    /**
     * Get the chart data and plot.
     *
     * @param accountId
     *  The account ID.
     * @param categoryId
     *  The category ID.
     *
     * @returns {$q.promise}
     */
    this.get = function(accountId, categoryId) {
      var deferred = $q.defer();

      Category.get(accountId, categoryId).then(function(categories) {
        deferred.resolve((categories.collection) ? transformDataToDatasets(categories.collection, categoryId) : {});
      });

      return deferred.promise;
    };

    /**
     * Return category object from the Google Pie Chart selection.
     *
     * @param selectedItem
     *  Selected item from the chart.
     *
     * @param chartData
     *  Actual Google Pie Chart data.
     *
     * @returns {Number}
     *  The category id.
     */
    this.getCategoryIdSelected = function(selectedItem, chartData) {
      return chartData.rows[selectedItem.row].c[2].id;
    };

    /**
     * ransform categories collection to Google Pie Chart object format.
     *
     * @param {*} categories
     *   The categories collection.
     * @param {Number} categoryId
     *   The category selected.
     *
     * @returns {*}
     *   Return categories collection for a depth, in the Google Pie Chart format.
     **/
    function transformDataToDatasets(categories, categoryId) {
      var depth = getDepth(categories, categoryId);

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
            {v: row.meters},
            {id: row.id}
          ]
        });
      }, rows);

      return rows
    }

    /**
     * Return the depth of the categories to show in the chart.
     *
     * @param categories
     *  The categories list.
     * @param categoryId
     *  The category ID selected.
     *
     * @returns {number}
     *  Number indicate the relation parent-children between categories.
     *
     */
    function getDepth(categories, categoryId) {
      var depth = 0;

      // Get depth from one of the elements.
      if (angular.isDefined(categoryId) && categories) {
        depth = categories[0].depth;
      }

      return depth;
    }

  });
