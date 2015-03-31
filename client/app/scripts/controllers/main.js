'use strict';

angular.module('negawattClientApp')
  .controller('MainCtrl', function ($scope, $state, $stateParams, Timedate, profile) {
    var defaultAccountId;

    if (profile) {
      // Get the active account.
      defaultAccountId = profile.account[0].id;
      profile.active = profile.account[0];

      // Set the account
      $scope.account = profile.active;
      $scope.user = profile.user;
      $scope.timedate = Timedate;
      $scope.accountId = profile.active.id;
      // Change the strate
      $state.go('main.map', {accountId: profile.active.id});
      // $stateParams.accountId
      console.log('MainCtrl::$stateParams.accountId::', profile.active.id);
    }
    else {
      // Redirect to login.
      $state.go('login');
    }



  });
