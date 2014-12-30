'use strict';

angular.module('negawattClientApp')
  .controller('MenuCtrl', function($scope, $state, Category) {

    /**
     * Reset category selection and back to the home.
     */
    $scope.reloadDashboard = function() {
      Category.resetSelectedCategory();
      $state.go('dashboard.controls');
    };

  });
