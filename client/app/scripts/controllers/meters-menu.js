'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller: MetersMenuCtrl
 */
angular.module('negawattClientApp')
  .controller('MetersMenuCtrl', function ($scope, $state, $stateParams, $filter, Category, Meter, FilterFactory) {


    // Selected tab in the categories selector.
    $scope.tab = 'sites';

    $scope.meterCategories = {
      1: {label: 'צ׳ילר', background: '#339933'},
      2: {label: 'מונה', background: '#FF6666'},
      3: {label: 'מטבח', background: '#003366'},
    };

    $scope.siteCategories = {
      1: {label: 'אולם ספורט', background: '#6699FF', icon: 'astral'},
      2: {label: 'מלון', background: '#6699FF', icon: 'astral'},
      3: {label: 'מבנה חינוך', background: '#003366', icon: 'astral', children: [4, 5]},
      4: {label: 'בית ספר', background: '#141F33', icon: 'astral'},
      5: {label: 'גן ילדים', background: '#141F33', icon: 'astral'},
    };

    $scope.meters = {
      11: {label: 'מונה ראשי', category: 2},
      12: {label: 'מטבח 1', category: 3},
      13: {label: 'צ׳ילר 1', category: 1},
      21: {label: 'מונה ראשי', category: 2},
    };

    $scope.sites = [
      {
        id: 1,
        label: 'מרינה',
        meters: [11, 12, 13],
        category: 2
      },
      {
        id: 2,
        label: 'וילג׳',
        meters: [21],
        category: 2
      },
    ];

    // Activate filter of meters only if we are in the principal state.
    $scope.filterMeters = FilterFactory.showCategoryFilters();


    var sites

    /**
     * Set the selected category, to keep in other states.
     *
     * @param id int
     *   The Category ID.
     */
    function setSelectedCategory(id) {
      FilterFactory.set('category', id);
    }
  });
