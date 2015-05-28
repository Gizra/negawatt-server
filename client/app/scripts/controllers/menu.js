'use strict';

angular.module('negawattClientApp')
  .controller('MenuCtrl', function($scope, $state, $stateParams, $location, $window, amMoment, Timedate, Category, account, profile, FilterFactory, Meter) {
    $scope.account = account;
    $scope.user = profile.user;
    $scope.timedate = Timedate;
    $scope.accountId = $stateParams.accountId;

    /**
     * Reset category selection and back to the home.
     */
    $scope.reloadDashboard = function() {
      // Clear filters.
      FilterFactory.clear();

      // Reset categories filters.
      Category.reset();

      // Refresh home and meter's map.
      $location.url($state.href('dashboard.withAccount').slice(2));
      Meter.refresh();
    };

  });
