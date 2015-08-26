'use strict';

angular.module('negawattClientApp')
  .service('ChartElectricityCompare', function (FilterFactory, Electricity) {

    this.requestElectricity = requestElectricity;

    /**
     * Request electricity data from the service (usally from the server)
     *
     * @param stateParams
     */
    function requestElectricity(stateParams) {
      // Refresh the electricity filters as active, and generate new hash.
      FilterFactory.set('electricity', stateParams);
      // Request electricity data with new data
      Electricity.refresh(FilterFactory.get('activeElectricityHash')) ;
    }

  });
