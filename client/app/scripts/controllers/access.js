'use strict';

angular.module('negawattClientApp')
  .controller('AccessCtrl', function($window, $scope, $state, Auth, Profile) {

    // Will be FALSE during login GET period - will cause the login button to be disabled.
    $scope.loginButtonEnabled = true;

    // Will be TRUE after failed login attempt.
    $scope.message = {};

    /**
     * Login a given user.
     *
     * If everything goes well, change state to 'main'.
     *
     * @param user
     *   Object with the properties "username" and "password".
     */
    $scope.login = function(user) {
      $scope.loginButtonEnabled = false;
      Auth.login(user).then(function() {
        $window.location = '#/'
      }, function(response) {
        $state.go('login');
        $scope.loginButtonEnabled = true;

        // Handle error messages.
        if (!response.data) {
          $scope.message.noServerConnection = true;
        }
        else if (response.data && response.status === 401) {
          $scope.message.loginFailed = true;
        }
        else {
          $scope.message.generalError = response.statusText;
        }

      });
    };

    /**
     * Logout current user.
     *
     * Do whatever cleaning up is required and change state to 'login'.
     */
    $scope.logout = function() {
      Auth.logout();
      $state.go('login');
    };

    /**
     * Clear message error messages.
     *
     * Do whatever cleaning up is required and change state to 'login'.
     */
    $scope.clear = function() {
      $scope.message = {};
    };
  });
