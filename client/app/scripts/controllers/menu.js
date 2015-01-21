'use strict';

angular.module('negawattClientApp')
  .controller('MenuCtrl', function($scope, $state, $stateParams, Category, account, profile) {
    $scope.account = account;
    $scope.user = profile.user;

    /**
     * Reset category selection and back to the home.
     */
    $scope.reloadDashboard = function() {
      Category.setSelectedCategory();
      $state.go('dashboard.withAccount.preload', {accountId: $stateParams.accountId});
    };

  });
