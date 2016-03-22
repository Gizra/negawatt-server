'use strict';

angular.module('negawattClientApp')
  .controller('MenuCtrl', function($scope, $state, $stateParams, $location, $window, amMoment, Timedate, SiteCategory, MeterCategory, account, profile, FilterFactory, Meter) {
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
      SiteCategory.reset();
      MeterCategory.reset();

      // Refresh home and meter's map.
      Meter.refresh();
      $state.go('map.withAccount');
    };

    $scope.goChart = function() {
      //$state.go('chart.withAccount');
      var loc = window.location.href;
      loc = loc.replace('map', 'chart');
      window.location.href = loc;
    };

    $scope.goMap = function() {
      //$state.go('map.withAccount');
      var loc = window.location.href;
      loc = loc.replace('chart', 'map');
      window.location.href = loc;
    };

  });
