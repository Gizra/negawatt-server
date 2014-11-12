'use strict';

angular.module('app')
  .controller('AccessCtrl', function($scope, Auth, $location, localStorageService) {

    $scope.login = function(user) {
      Auth.login(user).then(function() {
        $location.url('/');
      });
    };

    $scope.logout = function() {
      localStorageService.remove('access_token');
      $location.url('/pages/signin');
    };

  });
