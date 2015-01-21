'use strict';

angular.module('negawattClientApp')
  .controller('MessageCtrl', function($scope, $state, messages) {
    $scope.messages = messages;

  });
