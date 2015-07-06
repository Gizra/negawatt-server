'use strict';

angular.module('negawattClientApp')
  .controller('MessageCtrl', function($scope, $state, $filter, messages) {
    $scope.messages = $filter('groupBy')(messages, 'meter');
  });
