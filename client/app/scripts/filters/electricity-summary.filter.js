angular.module('negawattClientApp')
  .filter('summary', function () {

    /**
     * Filter electricity summary from electricity collection.
     *
     * @param collection
     *  The electricity collection.
     *
     * @returns {*}
     *  The electricity summary object.
     */
    return function (electricity){
      return electricity && electricity.summary || undefined;
    }

  });
