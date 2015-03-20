'use strict';

angular.module('negawattClientApp')
  .controller('ReportCtrl', function($scope, $state, meters, account, categories) {
    $scope.meters = meters;
    $scope.account = account;
    $scope.categories = categories;
    $scope.maxFreqText = function(maxFreq) {
      switch (maxFreq) {
        case '1':
          return 'שנה';
        case '2':
          return 'חודש';
        case '3':
          return 'יום';
        case '4':
          return 'שעה';
        case '5':
          return 'דקה';
      }
    };
    $scope.categoryText = function(categoryId) {
      return categories.list[categoryId].label;
    }

  });
