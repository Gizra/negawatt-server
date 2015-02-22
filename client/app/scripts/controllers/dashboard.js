'use strict';

angular.module('negawattClientApp')
  .controller('DashboardCtrl', function ($scope, $state, $stateParams, profile) {
    // Save chart height for resizeBlocks directive.
    $scope.chartHeight = $state.params.chartHeight;
    
    var defaultAccountId;
    if (profile) {
      // Apply only on the login wotkflow.
      if (!(Object.keys($stateParams).length) && $state.is('dashboard')) {
        // Get active account after login.
        defaultAccountId = profile.account[0].id;
        $state.go('dashboard.withAccount', {accountId: defaultAccountId});
      }
    }
    else {
      // Redirect to login.
      $state.go('login');
    }

  });
