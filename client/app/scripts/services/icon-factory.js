'use strict';

angular.module('negawattClientApp')
  .factory('IconFactory', function iconFactory($injector, $q) {
    // Save the icon extra options.
    var options;

    var icons = {
      // Define default configuration.
      default: {
        unselect: extendDefaultIcon('marker-blue.png'),
        select: extendDefaultIcon('marker-red.png'),
      },
      getIcon: getIcon,
      __createIcons: createIcons,
    };

    /**
     * Define the icons types as properties from a list of categories.
     * If they not are defined.
     *
     * @param categories
     *  The category list
     */
    function createIcons(categories) {
      // Each new icon type if added as a new proeprty of the object.
      angular.forEach(categories.list, function(category) {
        if (angular.isDefined(this[category.icon])) {
          return;
        }

        this[category.icon] = {
          unselect: extendDefaultIcon(category.icon + '-blue.png', options),
          select: extendDefaultIcon(category.icon +'-red.png', options),
        }
      }, this);
    }

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
    function getIcon(type, state) {
      var self = this;
      var deferred = $q.defer();
      // To avoid circular dependency, the inject get Category service
      // on run time.
      var category = $injector.get('SiteCategory');

      // Get category list.
      category.get().then(function(categories) {
        // Create icons, if not extist.
        self.__createIcons(categories);
        // Return the initial icon requested.
        deferred.resolve(self[type][state]);
      });

      return deferred.promise;
    }

    /**
     * Extend from default icon properties the new
     *
     * @param filename
     *  name of the filename
     * @param options
     * @returns {{iconUrl: string, shadowUrl: string, iconSize: number[], shadowSize: number[], iconAnchor: number[], shadowAnchor: number[], popupAnchor: *[]}}
     */
    function extendDefaultIcon(filename, options) {
      return {
        iconUrl: '../images/markers/' + filename,
        shadowUrl: '../images/shadow.png',
        iconSize: [32, 32], // size of the icon
        shadowSize: [20, 20],
        iconAnchor: [16, 29], // point of the icon which will correspond to marker's location
        shadowAnchor: [10, 12],  // the same for the shadow
        popupAnchor: [0, -25], // where the pop-up window will appear
        className: getClases(options),
        setOptions: setOptions
      }
    }

    /**
     * Return classes according the options.
     *
     * @param options
     *  Options object, like {transparent: true}
     *
     * @returns {*}
     */
    function getClases(options) {
      var cssClasses = '';

      if (options && options.hasOwnProperty('transparent') && !!options['transparent']) {
        cssClasses = 'leaflet-marker-icon-transparent';
      }

      return cssClasses;
    }

    /**
     * Set extra options to the icon.
     *
     * @param options
     *  Options object, like {transparent: true}
     */
    function setOptions(options) {
      this.className = getClases(options);
    }

    return icons;
  });
