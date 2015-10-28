'use strict';

angular.module('negawattClientApp')
  .controller('DashboardCtrl', function ($scope, $timeout, $state, $stateParams, profile, Alerts) {

    // Define share properties through the application controllers (view-model).
    $scope.vm = {
      alerts: Alerts
    };

    if (profile) {
      // Apply only on the login wotkflow.
      if (!(Object.keys($stateParams).length) && $state.is('dashboard')) {
        // Get active account after login.
        vm.defaultAccountId = profile.account[0].id;
        $state.go('dashboard.withAccount', {accountId: vm.defaultAccountId});
      }
    }
    else {
      // Redirect to login.
      $state.go('login');
    }

  });
