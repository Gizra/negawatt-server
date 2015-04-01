'use strict';

angular.module('negawattClientApp')
  .factory('MenuFactory', function menuFactory(Timedate, Profile) {
    var profile = {};

    /**
     *
     * @returns {*}
     */
    function getActiveAccount() {
      // Return account by parameter.
      profile.active = (profile.account) ? profile.active : profile.account[0];
      return profile.active;
    }

    return {
      /**
       * Set the profile object information for the menu object.
       *
       * @param value
       *  New profile information.
       */
      updateProfile: function (value) {
        profile = value;
      },
      /**
       * Update the active account from de list of accounts wirh access garanted
       * for the user.
       *
       * @param id
       *  Account Id
       */
      setActiveAccount: function (id) {

        profile.active = profile;
      },
      /**
       * Return active account.
       */
      getActiveAccount: getActiveAccount(),
      // Return active user information.
      user: profile.user,
      timedate: Timedate
    };


  });
