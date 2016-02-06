'use strict';

angular.module('negawattClientApp')
  .directive('chartPieCompare', function () {
    return {
      restrict: 'EA',
      templateUrl: 'scripts/directives/chart-pie-compare/chart-pie-compare.directive.html',
      controller: function chartPieUsageCtrl(ChartUsagePeriod, Chart, $filter, $scope, ApplicationState) {
        var ctrlPieChart = this;

        // Expose functions.
        ctrlPieChart.renderChart = renderChart;

        // Save the state of the directive (to handle views in the directive. "undefined|empty|loading|data").
        ctrlPieChart.state = 'loading';
        ctrlPieChart.sensorTree = null;

        // Register with appState. It will reply with a call to
        // takeSensorTree().
        ApplicationState.registerPieChart(this);

        // Receive sensor-tree from appState.
        this.takeSensorTree = function (tree) {
          ctrlPieChart.sensorTree = tree;
        };

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
         * @param summary {object}
         *  Electricity summary collection.
         */
        function renderChart(summary) {
          // Convert the data coming from the server into google chart format.
          ctrlPieChart.data = $filter('toPieChartDataset')(summary, ctrlPieChart.sensorTree.collection);

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
