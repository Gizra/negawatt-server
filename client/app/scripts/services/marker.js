'use strict';

angular.module('negawattClientApp')
  .factory('Marker', function ($injector, $state, $q, $timeout, Map, IconFactory) {

    // Save last marker selected.
    var selected;

    /**
     * Get the icon properties of a marker.
     *
     * @param type
     *    Name of the existing icons.
     * @param state
     *    Diferent state of the same icon (unselect / select).
     *
     * @returns {*}
     *    Properties of the icon.
     */
    function getIcon(type, state) {
      var testValue;
      // Get defined icon object.
      var icon = IconFactory[type] && IconFactory[type][state] || IconFactory.getIcon(type, state);

      return $q.when(icon);
    }

    return {
      // Initial definition.
      icon: {},
      /**
       * Return the name of icon according the category of the meter (defined first in the first position).
       *
       * @returns {*|string}
       */
      getCategory: function() {
        var category = Object.keys(this.meter_categories)[0];
        return category && this.meter_categories[category].name || 'default';
      },
      /**
       * Return "default" icon to set icon marker is unselected.
       */
      getSelected: function() {
        return selected;
      },
      /**
       * Return "default" icon to set icon marker is unselected.
       */
      unselect: function() {
        var self = this;
        getIcon(this.getCategory(), 'unselect').then(function(icon) {
          self.icon = icon;
        });
      },
      /**
       * Select a new marker.
       *
       * Unselect previous marker, and return the "selected" icon.
       */
      select: function() {
        var self = this;
        if (angular.isDefined(selected)) {
          selected.unselect();
        }
        selected = this;
        getIcon(this.getCategory(), 'select').then(function(icon) {
          self.icon = icon;
        });
        Map.centerMapByMarker(this);
      },
      /**
       * Return geoposition object {lag: 35.00, lng: 56.56}. Generally used to center the map by the marker.
       */
      getPosition: function() {
        return {
          lat: this.lat,
          lng: this.lng
        };
      }
    };
  });
