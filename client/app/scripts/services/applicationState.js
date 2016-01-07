'use strict';

angular.module('negawattClientApp')
  .service('ApplicationState', function ApplicationState($rootScope, $stateParams, Profile, SensorTree) {

    var applicationState = this;

    /**
     * Return the $stateParams
     *
     * This necesary if need the new $stateParams value and still $location
     * do not trigger url refresh.
     *
     * @type {$stateParams|*}
     */
    this.stateParams = $stateParams;

    /**
     * Selection type. A replication of $stateParams.sel.
     */
    this.sel = $stateParams.sel;

    /**
     * Selection ids. A replication of $stateParams.ids.
     */
    this.ids = $stateParams.ids;

    /**
     * Configure the initial values of a period, according the filters and data set.
     *
     * @param limits
     */
    this.selectionChanged = function() {
    };

    /**
     * Configure the initial values of a period, according the filters and data set.
     *
     * @param limits
     */
    this.periodChanged = function() {
    };

    /**
     * Configure the initial values of a period, according the filters and data set.
     *
     * @param limits
     */
    this.frequencyChanged = function() {
    };

    /**
     * Handle selection change.
     */
    $rootScope.$on('selectionChanged', function () {
      // Set the current selection label.
      var title = '';
      if ($stateParams.sel) {
        // Set marker label.
        var selectedObjects = $stateParams.ids.split(',');
        var classLetter = '';
        switch ($stateParams.sel) {
          case 'meter':
            classLetter = 'm';
            break;

          case 'meter_site':
            classLetter = 's';
            break;

          case 'site_category':
            classLetter = 'c';
            break;
        }

        SensorTree.get()
          .then(function(sensorTree) {
            selectedObjects = selectedObjects.map(function (id) {
              return sensorTree.collection[classLetter + id].name;
            });
            title = selectedObjects.join(', ');
            $rootScope.$broadcast('setChartTitleTo', title);
          });
      }
      else {
        // Otherwise display account label.
        // Find the current selected account in the user's accounts.
        Profile.get()
          .then(function(profile) {
            angular.forEach(profile.account, function(account) {
              if (account.id == $stateParams.accountId) {
                title = account.label;
                return;
              }
            });
            $rootScope.$broadcast('setChartTitleTo', title);
          });
      }
    });

  });
