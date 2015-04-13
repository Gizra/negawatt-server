'use strict';

angular.module('negawattClientApp')
  .controller('MenuCtrl', function($scope, $state, $stateParams, $location, $window, amMoment, Timedate, Category, account, profile) {
    $scope.account = account;
    $scope.user = profile.user;
    $scope.timedate = Timedate;
    $scope.accountId = $stateParams.accountId;

    /**
     * Reset category selection and back to the home.
     */
    $scope.reloadDashboard = function() {
      Category.clearSelectedCategory();
      $window.location = $state.href('dashboard.withAccount');
    };

  });
