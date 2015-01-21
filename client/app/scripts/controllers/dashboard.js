'use strict';

angular.module('negawattClientApp')
  .controller('DashboardCtrl', function ($state, profile) {
    var defaultAccountId;
    if (profile) {
      // Get active account it's always in the .
      defaultAccountId = profile.account[0].id;
      $state.go('dashboard.withAccount.preload', {accountId: defaultAccountId});
    }
    else {
      // Redirect to login.
      $state.go('login');
    }

  });
