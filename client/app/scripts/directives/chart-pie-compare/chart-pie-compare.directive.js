'use strict';

angular.module('negawattClientApp')
  .directive('chartPieCompare', function () {
    return {
      restrict: 'EA',
      templateUrl: 'scripts/directives/chart-pie-compare/chart-pie-compare.directive.html',
      controller: function chartPieUsageCtrl(ChartUsagePeriod, Chart, $stateParams, $filter, $scope, $state, ApplicationState, Utils) {
        var ctrlPieChart = this;

        // Save the state of the directive (to handle views in the directive. "undefined|empty|loading|data").
        ctrlPieChart.state = 'loading';

        // Select category form the pie chart.
        $scope.onSelect = function(selectedItem, chartData) {

          var row = selectedItem.row;
          var onSelect = chartData.data.rows[row].c[3].onSelect;

          ApplicationState.updateSelection(onSelect.sel, onSelect.ids, true /*refreshCheckMarks*/);
        };

        /**
         * Messages to show when there is no data.
         *
         * @type {{empty: string}}
         */
        ctrlPieChart.messages = {
          empty: ChartUsagePeriod.messages.empty
        };

        /**
         * Directive Event: When new electricity data is updated from the server.
         */
        $scope.$watchGroup(['ctrlPieChart.summary', 'ctrlPieChart.options'], function(chart) {
          if (angular.isUndefined(chart)
            || Utils.isEmpty(chart[0])
            || angular.isUndefined(chart[1])) {

            return;
          }

          renderChart(chart[0], chart[1]);

        }, true);

        $scope.$on('nwChartBeginLoading', function() {
          setState('loading');
        });

        // Private functions.

        /**
         * Set User interface state.
         *
         * @param state
         */
        function setState(state) {
          if (angular.isDefined(state)) {
            ctrlPieChart.state = state;
            return;
          }

          // If state is not defined calculate the actual state according the
          // property ctrlPieChart.data
          ctrlPieChart.state = hasData() ? 'data' : 'empty';
        }

        /**
         * Check state of the it
         */
        function isState(state) {
          return ctrlPieChart.state === state;
        }

        /**
         * Return true if the directive has a valid state, otherwise is false.
         *
         * Avoid change on directive definition, in a invalid state.
         *
         * @returns {*}
         */
        function isInitialized() {
          return !angular.isUndefined(ctrlPieChart.state);
        }

        /**
         * Return true if ctrlPieChart.data have valid electricity data, otherwise
         * false.
         *
         * @returns {*|boolean}
         */
        function hasData() {
          return ctrlPieChart.data.data.rows && ctrlPieChart.data.data.rows.length || false;
        }

        /**
         * Render chart with the active electricity data according the
         * period and the chart selected.
         *
         * @param activeElectricity
         *  The "active electricity" data collection.
         */
        function renderChart(summary, options) {
          // Take sites, meters, and categories from chartDetailedCtrl's scope.
          var chartDetailedScope = $scope.$parent.$parent;
          var labels;
          switch (summary.type) {
            case 'site_categories':
              labels = chartDetailedScope.siteCategories.collection;
              break;
            case 'sites':
              labels = chartDetailedScope.sites.listAll;
              break;
            case 'meters':
              labels = chartDetailedScope.meters.listAll;
              break;
          }

          // Convert the data coming from the server into google chart format.
          ctrlPieChart.data = $filter('toPieChartDataset')(summary, labels);

          // Update state.
          setState();
        }
      },
      controllerAs: 'ctrlPieChart',
      bindToController: true,
      // Isolate scope.
      scope: {
        summary: '=',
        options: '='
      }
    };
  });
