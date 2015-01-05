'use strict';

angular.module('negawattClientApp')
  .controller('MapCtrl', function ($scope, $state, $stateParams) {
    var openedPopup = null;

    // Hover above marker in the Map -  open tooltip.
    $scope.$on("leafletDirectiveMarker.mouseover", function(event, args) {
      var leafletId = args.markerName;
      // If this popup is already opened, do nothing.
      if ($stateParams.openedPopup === leafletId) {
        return;
      }
      // Open tooltip popup window.
      $stateParams.openedPopup = leafletId;
      var leaflet = args.leafletEvent.target;
      leaflet.openPopup();
    });

    // Hover out of marker in the Map - close tooltip.
    $scope.$on("leafletDirectiveMarker.mouseout", function(event, args) {
      var leaflet = args.leafletEvent.target;
      leaflet.closePopup();
      $stateParams.openedPopup = null;
    });

    // Reload the current $state when meters added more.
    $scope.$on('negawattMetersChanged', function() {
      $state.reload();
    });

  });
