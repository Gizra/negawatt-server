'use strict';

angular.module('negawattClientApp')
  .factory('MenuFactory', function menuFactory(Timedate, Profile, Utils) {
    var profile = {};

    return {
      /**
       * Set the profile object information for the menu object.
       *
       * @param value
       *  New profile information.
       */
      updateProfile: function (value) {
        profile = value;

        profile.account = Utils.indexById(profile.account);

        this.setActiveAccount();
      },
      /**
       * Update the active account from de list of accounts wirh access garanted
       * for the user.
       *
       * @param id
       *  Account Id
       */
      setActiveAccount: function (id) {
        Profile.selectActiveAccount(id);
      },
      // Return active account form default account or selected via url,
      // otherwise return undefiend.
      getActiveAccount: function() {
        return profile.active;
      },
      // Return active user information.
      getUser: function() {
        return profile.user;
      },
      timedate: Timedate
    };


  });
