'use strict';

angular.module('negawattClientApp')
  .controller('MainCtrl', function ($state, $stateParams, Timedate, profile) {
    var self = this;
    var defaultAccountId;

    if (profile) {
      // Get the active account.
      defaultAccountId = profile.account[0].id;
      self.active = profile.active = profile.account[0];

      // Set the account.
      self.account = profile.active;
      self.user = profile.user;
      self.timedate = Timedate;
      self.accountId = profile.active.id;
      // Change the strate.
      $state.go('main.map', {accountId: profile.active.id});

    }
    else {
      // Redirect to login.
      $state.go('login');
    }

  });
