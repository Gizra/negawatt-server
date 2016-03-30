'use strict';

angular.module('negawattClientApp')
  .filter('siteById', function (Utils, FilterFactory, $filter) {
    /**
     * From a collection of sites filter site with categories in the list of categories ids.
     *
     * @param sites
     *  The sites collection to filter.
     * @param id
     *  Id of the site to return.
     *
     * @returns {*}
     *  The site object.
     */
    return function (sites, id){
      var site;

      site = angular.copy(sites)[id] || [];

      return !Utils.isEmpty(site) && site || {};
    }
  });
