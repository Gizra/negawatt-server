'use strict';

angular.module('negawattClientApp')
  .controller('AccessCtrl', function($scope, $state, Auth, Profile) {

    // Will be FALSE during login GET period - will cause the login button to be disabled.
    $scope.loginButtonEnabled = true;

    // Will be TRUE after failed login attempt.
    $scope.loginFailed = false;

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
        $state.go('main');
      }, function() {
        $state.go('login');
        $scope.loginButtonEnabled = true;
        $scope.loginFailed = true;
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
  });
