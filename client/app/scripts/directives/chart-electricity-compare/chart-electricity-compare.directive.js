'use strict';

angular.module('negawattClientApp')
  .directive('chartElectricityCompare', function () {
    return {
      restrict: 'EA',
      templateUrl: 'scripts/directives/chart-electricity-compare/chart-electricity-compare.directive.html',
      controller: function chartElectricityUsageCtrl(ChartElectricityUsage, ChartUsagePeriod, $stateParams, $filter, $scope, Utils) {
        var ctrlChart = this;

        // Get chart frequencies. (Tabs the period of time)
        ctrlChart.frequencies = ChartUsagePeriod.getFrequencies();
        // Save the state of the directive (to handle views in the directive. "undefined|empty|loading|data").
        ctrlChart.state = 'loading';

        ctrlChart.showNavigation = showNavigation;
        ctrlChart.changePeriod = changePeriod;
        ctrlChart.hasData = hasData;
        ctrlChart.changeFrequency = changeFrequency;

        // Select category from the chart.
        // @todo: make it work.
        $scope.onSelect = function(selectedItem, chartData) {

          var row = selectedItem.row;
          var col = selectedItem.column;
          var timestamp = chartData.data.rows[row].timestamp;

          // 'Drill down' to the referred timestamp, one frequency step higher.
          // Reload electricity to update charts.
          ChartUsagePeriod.setReferenceDate(timestamp);
          var frequency = $stateParams.chartFreq;
          // Increase frequency by one step.
          (frequency < 5) && frequency++;
          ChartUsagePeriod.changeFrequency(frequency);
          // Update electricty with new parameters.
          ChartElectricityUsage.requestElectricity(ChartUsagePeriod.stateParams);
        };

        /**
         * Messages to show when there is no data.
         *
         * @type {{empty: string}}
         */
        ctrlChart.messages = {
          empty: ChartUsagePeriod.messages.empty
        };

        /**
         * Directive Event: When new electricity data is updated from the server.
         */
        $scope.$watchGroup(['ctrlChart.electricity', 'ctrlChart.compareCollection', 'ctrlChart.options', 'ctrlChart.summary'], function(chart) {
          if (angular.isUndefined(chart)
            || Utils.isEmpty(chart[0])
            || angular.isUndefined(chart[2])) {

            return;
          }

          renderChart(chart[0], chart[1], chart[2], chart[3]);

        }, true);

        $scope.$on('nwChartBeginLoading', function() {
          setState('loading');
        });

        // Privete functions.

        /**
         * Set User interface state.
         *
         * @param state
         */
        function setState(state) {
          if (angular.isDefined(state)) {
            ctrlChart.state = state;
            return;
          }

          // If state is not defined calculate the actual state according the
          // property ctrlChart.data
          ctrlChart.state = hasData() ? 'data' : 'empty';
        }

        /**
         * Check state of the it
         */
        function isState(state) {
          return ctrlChart.state === state;
        }

        /**
         * Return true if the directive has a valid state, otherwise is false.
         *
         * Avoid change on directive definition, in a invalid state.
         *
         * @returns {*}
         */
        function isInitialized() {
          return !angular.isUndefined(ctrlChart.state);
        }

        /**
         * Return true is ctrlChart.data have valid electricity data, otherwise
         * false.
         *
         * @returns {*|boolean}
         */
        function hasData() {
          return ctrlChart.data.data.rows.length || false;
        }

        /**
         * Check if next/previous period has valid data.
         *
         * @param direction
         *  Text indicate the direccion of period posible move next|previous.
         * @returns {boolean}
         */
        function showNavigation(direction) {
          if (!isInitialized() || !hasData()) {
            return false;
          }

          return ChartUsagePeriod.hasPeriod(direction);
        }

        /**
         * Change the actual period to next or previous, and request the new
         * electricity data.
         *
         * @param periodDirection
         *  String indicate the direction of the new period next or previous.
         */
        function changePeriod(periodDirection) {
          if (!isInitialized()) {
            return;
          }

          ChartUsagePeriod.changePeriod(periodDirection);
          ChartElectricityUsage.requestElectricity(ChartUsagePeriod.stateParams);
        }

        /**
         * Change frequency of the chart.
         *
         * @param type
         *  The type of frequency according the period of time selected.
         */
        function changeFrequency(type) {
          if (!isInitialized()) {
            return;
          }

          ChartUsagePeriod.changeFrequency(type);
          ChartElectricityUsage.requestElectricity(ChartUsagePeriod.stateParams);
        }

        /**
         * Render chart with the active electricity data according the
         * period and the chart selected.
         *
         * @param activeElectricity
         *  The "active electricity" data collection.
         * @param compareCollection
         *  Data collection to compare to.
         * @param options
         *  Chart options.
         * @param summary
         *  Electricity summary.
         */
        function renderChart(activeElectricity, compareCollection, options, summary) {
          // type is one of 'meters', 'sites', 'site_categories'.
          var labelsType = summary.type;

          // Check if only one item (category, site) is selected.
          var oneItemSelected = !$stateParams.ids || $stateParams.ids.split(',').length == 1;

          // If only one category is selected, use account name for label. If only one site
          // is selected, us site-categories for label.
          if (oneItemSelected) {
            if (labelsType == 'site_categories') {
              labelsType = 'accounts';
            }
            else if (labelsType == 'sites') {
              labelsType = 'site_categories';
            }
            else if (labelsType == 'meters') {
              labelsType = 'sites';
            }
          }

          // Take sites, meters, and categories from chartDetailedCtrl's scope.
          var detailedChartScope = $scope.$parent.$parent;
          var detailedChartCtrl = detailedChartScope.detailedChartCtrl;
          var labels = {}, labelsField;
          switch (labelsType) {
            case 'accounts':
              // Create an object with the account name.
              labels[detailedChartCtrl.account] = {label: detailedChartCtrl.title};
              labelsField = 'meter_account';
              break;
            case 'site_categories':
              labels = detailedChartScope.siteCategories.collection;
              labelsField = 'site_category';
              break;
            case 'sites':
              labels = detailedChartScope.sites.listAll;
              labelsField = 'meter_site';
              break;
            case 'meters':
              labels = detailedChartScope.meters.listAll;
              labelsField = 'meter';
              break;
          }

          var compareLabelsField = 'avg_temp';

          // Convert the data coming from the server into google chart format.
          ctrlChart.data = $filter('toChartDataset')(activeElectricity, $stateParams.chartType, compareCollection, options, labels, labelsField, compareLabelsField, oneItemSelected);

          // Update state.
          setState();
        }
      },
      controllerAs: 'ctrlChart',
      bindToController: true,
      // Isolate scope.
      scope: {
        electricity: '=',
        compareCollection: '=',
        options: '=',
        summary: '='
      }
    };
  });
