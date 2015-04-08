'use strict';

angular.module('negawattClientApp')
  .factory('IconFactory', function iconFactory($injector, $q) {

    var icons = {
      // Define default configuration.
      default: {
        unselect: extendDefaultIcon('marker-blue.png'),
        select: extendDefaultIcon('marker-red.png'),
      },
      /**
       * Define the icons types as properties from a list of categories.
       * If they not are defined.
       *
       * @param categories
       *  The category list
       */
      createIcons: function(categories) {
        // Each new icon type if added as a new proeprty of the object.
        angular.forEach(categories.list, function(category) {
          if (angular.isDefined(this[category.icon])) {
            return;
          }

          this[category.icon] = {
            unselect: extendDefaultIcon(category.icon + '-blue.png'),
            select: extendDefaultIcon(category.icon +'-red.png'),
          }
        }, this);
      },
      /**
       * Return and specific icon object prepare for a leaflet map.
       *
       * @param type
       *  The name of the icon according the category, exemple 'education'
       * @param state
       *  The state of the icon (select/unselect)
       *
       * @returns {*}
       */
      getIcon: function(type, state) {
        var self = this;
        var deferred = $q.defer();
        // To avoid circular dependency, the inject get Category service
        // on run time.
        var category = $injector.get('Category');

        // Get category list.
        category.get().then(function(categories) {
          // Create icons, if not extist.
          self.createIcons(categories);
          // Return the initial icon requested.
          deferred.resolve(self[type][state]);
        });

        return deferred.promise;
      }
    };

    /**
     * Extend from default icon properties the new
     *
     * @param filename
     * @returns {{iconUrl: string, shadowUrl: string, iconSize: number[], shadowSize: number[], iconAnchor: number[], shadowAnchor: number[], popupAnchor: *[]}}
     */
    function extendDefaultIcon(filename) {
      return {
        iconUrl: '../images/markers/' + filename,
        shadowUrl: '../images/shadow.png',
        iconSize: [40, 40], // size of the icon
        shadowSize: [26, 26],
        iconAnchor: [32, 30], // point of the icon which will correspond to marker's location
        shadowAnchor: [25, 7],  // the same for the shadow
        popupAnchor: [-10, -25] // where the pop-up window will appear
      }
    }

    return icons;
  });
