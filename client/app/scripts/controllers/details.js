'use strict';

angular.module('negawattClientApp')
  .controller('DetailsCtrl', function ($scope, $stateParams) {
    // Share meter selected.
    $scope.meterSelected = $scope.meters[$stateParams.markerId];
  });
