'use strict';

angular.module('negawattClientApp')
  .controller('MainCtrl', function ($state, $stateParams, MenuFactory, profile) {
    var self = this;

    if (profile) {
      // Extend the controller with the menu object.
      angular.extend(self, MenuFactory);
      // Update profile information.
      self.updateProfile(profile);

      // Default account selection, an redirect to the corresponding $state.
      if ($state.is('main')) {
        // Change active account, if was specify in the url.
        // Example: /home/102
        if ($stateParams.accountId) {
          self.setActiveAccount($stateParams.accountId);
        }

        // Load the home state for the active account.
        $state.go('main.map', {accountId: self.getActiveAccount().id});
      }
    }
    else {
      // Redirect to login.
      $state.go('login');
    }

  });
