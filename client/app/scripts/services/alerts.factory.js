'use strict';

angular.module('negawattClientApp')
  .factory('Alerts', function ($timeout) {
    var alerts = [];

    var properties = {
      new: function(alert) {
        alerts.push(alert);

        $timeout(this.close, 3000, true, alerts.length-1);
      },
      close: function(index) {
        alerts.splice(index, 1);
      }
    };
    alerts = angular.extend(alerts, properties);

    return alerts;
  });
