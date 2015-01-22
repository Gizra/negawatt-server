'use strict';

angular.module('negawattClientApp')
  .controller('MenuCtrl', function($scope, $state, $stateParams, weatherService, Category, account, profile) {
    $scope.account = account;
    $scope.user = profile.user;

    var weather = weatherService.getWeather('Tel');

    /**
     * Reset category selection and back to the home.
     */
    $scope.reloadDashboard = function() {
      Category.setSelectedCategory();
      $state.go('dashboard.withAccount.preload', {accountId: $stateParams.accountId});
    };

  });
