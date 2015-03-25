'use strict';

angular.module('negawattClientApp')
  .controller('MainCtrl', function ($scope, $state, $stateParams, profile) {
    var defaultAccountId;
    if (profile) {
      // Get the active account.
      defaultAccountId = profile.account[0].id;
      profile.active = profile.account[0];

      //// Apply only on the login wotkflow.
      //if (!(Object.keys($stateParams).length) && $state.is('dashboard')) {
      //  // Get active account after login.
      //  $state.go('main.menu.map', {accountId: defaultAccountId});
      //}
    }
    else {
      // Redirect to login.
      $state.go('login');
    }

    // Set the account
    $scope.account = profile.active;
  });
