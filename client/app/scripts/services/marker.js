'use strict';

angular.module('negawattClientApp')
  .factory('Marker', function ($injector, $state, $q, $timeout, Map, IconFactory, FilterFactory) {
    // Save last marker selected.
    var selected = FilterFactory.getMeterSelected();

    return {
      // Initial definition.
      icon: {},
      getCategory: getCategory,
      getSelected: getSelected,
      unselect: unselect,
      select: select,
      getPosition: getPosition
    };

    /**
     * Return the name of icon according the category of the meter (defined first in the first position).
     *
     * @returns {*|string}
     */
    function getCategory() {
      var category = this.site_categories && Object.keys(this.site_categories)[0];
      return category && this.site_categories[category].name || 'default';
    }

    /**
     * Return "default" icon to set icon marker is unselected.
     */
    function getSelected() {
      return selected;
    }

    /**
     * Return "default" icon to set icon marker is unselected.
     */
    function unselect() {
      var self = this;
      getIcon(this.getCategory(), 'unselect').then(function(icon) {
        self.icon = icon;
      });
    }

    /**
     * Select a new marker.
     *
     * Unselect previous marker, and return the "selected" icon.
     */
    function select() {
      var self = this;
      if (angular.isDefined(selected)) {
        selected.unselect();
      }
      FilterFactory.setMeterSelected(this);
      getIcon(this.getCategory(), 'select').then(function(icon) {
        self.icon = icon;
      });
    }

    /**
     * Return geoposition object {lag: 35.00, lng: 56.56}. Generally used to center the map by the marker.
     */
    function getPosition() {
      return {
        lat: this.lat,
        lng: this.lng
      };
    }

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

  });
