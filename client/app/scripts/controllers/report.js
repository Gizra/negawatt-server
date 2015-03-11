'use strict';

angular.module('negawattClientApp')
  .controller('ReportCtrl', function($scope, $state, meters) {
    $scope.meters = meters;

  });
