'use strict';

angular.module('negawattClientApp')
  .controller('MenuCtrl', function($scope, $state, $stateParams, weatherService, amMoment, Timedate, Category, account, profile) {
    $scope.account = account;
    $scope.user = profile.user;
    $scope.timedate = Timedate;
    $scope.accountId = $stateParams.accountId;

    var weather = weatherService.getWeather('Tel');

    /**
     * Reset category selection and back to the home.
     */
    $scope.reloadDashboard = function() {
      Category.clearSelectedCategory();
      $state.forceGo('dashboard.withAccount', {accountId: $stateParams.accountId});
    };

  });
