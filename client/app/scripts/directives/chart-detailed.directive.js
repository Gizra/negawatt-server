'use strict';

angular.module('negawattClientApp')
  .directive('chartDetailed', function () {
    return {
      templateUrl: 'scripts/directives/chart-detailed.directive.html',
      controller: function chartDetailedCtrl(ChartElectricityUsage, ChartUsagePeriod, $filter, $scope, $stateParams, FilterFactory) {
        var vm = this;
        var ctrlChart = this;

        $scope.dateRange = ctrlChart.date;

        // Get chart frequencies. (Tabs the period of time)
        ctrlChart.frequencies = ChartUsagePeriod.getFrequencies();
        // Save the state of the directive (to handle views in the directive. "undefined|empty|loading|data").
        ctrlChart.state = 'loading';

        ctrlChart.showNavigation = showNavigation;
        ctrlChart.changePeriod = changePeriod;
        ctrlChart.hasData = hasData;
        ctrlChart.changeFrequency = changeFrequency;

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
        $scope.$watch('ctrlChart.electricity', function(electricity) {
          if (angular.isUndefined(electricity)) {
            return;
          }

          // Update the title's date range, according to the first and last
          // selected electricity records.
          var firstEntry = electricity[0];
          var lastEntry = electricity[electricity.length - 1];
          $scope.dateRange = ChartUsagePeriod.formatDateRange(firstEntry.timestamp * 1000, lastEntry.timestamp * 1000);

          renderChart(electricity);

        }, true);

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
         */
        function renderChart(activeElectricity) {
          // Update data comming fron the server into the directive.
          ctrlChart.data = $filter('toChartDataset')(activeElectricity);
          // Update state.
          setState();
        }


        // Category id selected from pie chart.
        var categoryId;
        // Summary property of electricity.
        var summary;

        $scope.categories = vm.categories;

        // Public controller API
        vm.categoriesChart = {};
        vm.hasData = hasData;
        // Save dataset values, until wait for load the dataset labels
        // (in the data type meters).
        vm.dataset;

        if ($stateParams.markerId) {
          setSelectedMarker($stateParams.markerId);
          meterSelectedExist();
        }

        // Go to the a new category selected form the pie chart.
        $scope.onSelect = function(selectedItem, chartData) {
          if (summary.type === 'category') {
            categoryId = ChartCategories.getCategoryIdSelected(selectedItem, chartData);
            if (angular.isDefined(categoryId)) {
              $state.go('dashboard.withAccount.categories', {accountId: $stateParams.accountId, categoryId: categoryId});
            }
          }
        };

        // Select the meter when is comming with the 'lazy load'
        $scope.$on('nwMetersChanged', function(event, meters) {
          $scope.meterSelected = meters.list[$stateParams.markerId];

          vm.metersLoaded = meters.loaded;
          if (meters.loaded) {
            meterSelectedExist();
            render();
          }
        });

        /**
         * Electricity Service Event: When electricity change update Pie chart of
         * consumption, according the summary data.
         */
        $scope.$on('nwElectricityChanged', function(event, electricity) {
          if (angular.isDefined($stateParams.markerId)) {
            return;
          }

          var labels;
          // Get summary data from electricity.
          summary = $filter('summary')(electricity[FilterFactory.get('activeElectricityHash')]);

          if (angular.isUndefined(summary)) {
            return;
          }

          // Set collection (Categories | Meters) to add labels on the pie chart. According the summary type data.
          if (summary.type === 'category') {
            labels = vm.categories.collection;
            renderChart(summary, labels);
          }
          else {
            labels = {};
            vm.dataset = {
              summary: summary,
              labels: labels
            }

          }

          // Render pie chart in case of electricity data update.
          //  render();
        });

        /**
         * Set the selected Meter.
         *
         * @param id int
         *   The Marker ID.
         */
        function setSelectedMarker(id) {
          // Use in the widget 'Details'.
          $scope.meterSelected = meters.list[id];
        }

        // Generate alert if the a meter is selected and is not defined in the UI.
        function render() {
          // Render pie chart.
          if (angular.isDefined(vm.dataset)) {
            renderChart(vm.dataset.summary, $scope.meters.listAll);
          }
        }

        function meterSelectedExist() {
          // Handle applications alerts.
          if (angular.isUndefined($scope.meterSelected) && $state.is('dashboard.withAccount.markers')) {
            $scope.vm.alerts.new({type: 'default', msg: 'מונה לא קיים.'});
          }
        }
      },
      controllerAs: 'ctrlChart',
      bindToController: true,
      scope: {
        electricity: '=',
        date: '=',
        categories: '='
      }
    };
  });
