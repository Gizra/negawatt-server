'use strict';

angular.module('negawattClientApp')
  .controller('MessageCtrl', function($scope, $state, $filter, FilterFactory, messages) {
    var vm = this;

    $scope.messages = $filter('groupBy')(messages, 'meter');

    /**
     * Transitioning the the state of select meter.
     *
     * @param e
     *  Click event.
     * @param meter
     *  The meter Id.
     */
    vm.selectMeter = function(clickEvent, meter) {
      $state.forceGo('dashboard.withAccount.markers',
        {
          markerId: meter,
          categoryId: FilterFactory.get('category')
        });

      // Avoid to toogle the accordion on heading, when changing state.
      clickEvent.stopPropagation();
    }

  });
