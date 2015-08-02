'use strict';

/**
 * @ngdoc function
 * @name negawattClientApp.controller: MetersMenuCtrl
 */
angular.module('negawattClientApp')
  .controller('MetersMenuCtrl', function ($scope, $state, $stateParams, $filter, Category, Meter, FilterFactory) {
    // Selected tab in the categories selector.
    $scope.tab = 'sites';

    $scope.categories = {
      1: {label: 'צ׳ילר', background: '#339933', icon: 'astral', meters: [13]},
      2: {label: 'מונה', background: '#FF6666', icon: 'astral', meters: [11, 21]},
      3: {label: 'מטבח', background: '#003366', icon: 'astral', meters: [12]},
      51: {label: 'אולם ספורט', background: '#6699FF', icon: 'astral'},
      52: {label: 'מלון', background: '#6699FF', icon: 'astral'},
      53: {label: 'מבנה חינוך', background: '#003366', icon: 'astral'},
      54: {label: 'בית ספר', background: '#141F33', icon: 'astral'},
      55: {label: 'גן ילדים', background: '#141F33', icon: 'astral'}
    };

    $scope.meters = {
      11: {label: 'מונה ראשי', categories: [2], site: 101},
      12: {label: 'מטבח 1', categories: [3], site: 101},
      13: {label: 'צ׳ילר 1', categories: [1, 3], site: 101},
      21: {label: 'מונה ראשי', categories: [2], site: 102}
    };

    $scope.sites = {
      101: {label: 'מרינה', meters: [11, 12, 13], categories: [52]},
      102: {label: 'וילג׳', meters: [21], categories: [52]}
    };

    $scope.meterCategoriesTree = [
      {
        id: 4,
        label: 'מונים',
        categories: [
          {
            id: 5,
            label: 'מונה ראשי',
            meters: [11, 12, 21],
          },
          {
            id: 6,
            label: 'צ׳ילרים',
            meters: [13]
          }
        ]
      }
    ];

    $scope.siteCategoriesTree = [
      {
        id: 7,
        label: 'מלונות',
        categories: [
          {
            id: 5,
            label: 'מרינה',
            meters: [11, 12, 21]
          },
          {
            id: 6,
            label: 'וילג׳',
            meters: [13]
          }
        ]
      }
    ];
  });
