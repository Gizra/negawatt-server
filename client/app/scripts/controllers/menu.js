'use strict';

angular.module('negawattClientApp')
  .controller('MenuCtrl', function($scope, $state, $stateParams, $location, $window, amMoment, Timedate, Category, account, profile, MeterFilter, Meter) {
    $scope.account = account;
    $scope.user = profile.user;
    $scope.timedate = Timedate;
    $scope.accountId = $stateParams.accountId;

    /**
     * Reset category selection and back to the home.
     */
    $scope.reloadDashboard = function() {
      // Clear filters.
      MeterFilter.clear();

      // Reset Categories and refresh home.
      Category.get().then(function(categories) {
        MeterFilter.set('categorized', categories);
        $location.url($state.href('dashboard.withAccount').slice(2));
        Meter.refresh();
      });
    };

  });
