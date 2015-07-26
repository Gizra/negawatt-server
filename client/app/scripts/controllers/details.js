'use strict';

angular.module('negawattClientApp')
  .controller('DetailsCtrl', function ($scope, $state, $stateParams, FilterFactory, Chart, ChartCategories, meters, $filter, categories) {
    var vm = this;
    // Category id selected from pie chart.
    var categoryId;
    // Summary property of electricity.
    var summary;

    $scope.categories = categories;
    $scope.meters = meters;

    // Public API Controller
    vm.categoriesChart = {};
    vm.message = Chart.messages.empty;
    vm.hasData = hasData;
    // Save dataset values, until wait for load the dataset labels
    // (in the data type meters).
    vm.dataset;
    // Go back a level up of the category.
    vm.back = back;
    vm.onSelect = onSelect;
    vm.hideBackButton = hideBackButton;

    if ($stateParams.markerId) {
      setSelectedMarker($stateParams.markerId);
      meterSelectedExist();
    }

    if ($stateParams.categoryId) {
      setParentCategory($stateParams.categoryId, categories);
    }

    // Select the meter when is comming with the 'lazy load'
    $scope.$on('nwMetersChanged', function(event, meters) {
      $scope.meterSelected = meters.list[$stateParams.markerId];

      vm.metersLoaded = meters.loaded;
      if (meters.loaded) {
        meterSelectedExist();
        render();
      }
    });

     // Electricity Service Event: When electricity change update Pie chart of
     // consumption, according the summary data.
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
        labels = $scope.categories.collection;
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
      vm.metersLoaded = meters.loaded;
      if (vm.metersLoaded) {
        render();
      }
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

    /**
     * Return true is there are electricity data to show the chart,
     * otherwise false.
     *
     * @returns {boolean}
     */
    function hasData() {
      return vm.categoriesChart.data && !!vm.categoriesChart.data.rows.length;
    }

    /**
     * Generate alert if the a meter is selected and is not defined in the UI.
     */
    function render() {
      // Render pie chart.
      if (angular.isDefined(vm.dataset)) {
        renderChart(vm.dataset.summary, $scope.meters.listAll);
      }
    }

    /**
     * Render piw chart with summary information and
     *
     * @param summary
     * @param labels
     */
    function renderChart(summary, labels) {
      // Prepare the content as Google Chart Dataset object definition.
      vm.categoriesChart = $filter('toPieChartDataset')(summary, labels);
    }

    /**
     * Show an message if the selected do not exsit.
     */
    function meterSelectedExist() {
      // Handle applications alerts.
      if (angular.isUndefined($scope.meterSelected) && $state.is('dashboard.withAccount.markers')) {
        $scope.vm.alerts.new({type: 'default', msg: 'מונה לא קיים.'});
      }
    }

    /**
     *
     */
    function back() {
      $state.go('dashboard.withAccount.categories', {accountId: $stateParams.accountId, categoryId: vm.parentCategory});
    }

    /**
     * Hide back button
     *
     * @returns {boolean}
     */
    function hideBackButton() {
      //!chart.hasData() || chart.meterSelected || !!chart.parentCategory
      return !vm.parentCategory;
    }

    // Go to the a new category selected form the pie chart.
    function onSelect(selectedItem, chartData) {
      if (summary.type === 'category') {
        vm.parentCategory;
        categoryId = ChartCategories.getCategoryIdSelected(selectedItem, chartData);
        if (angular.isDefined(categoryId)) {
          $state.go('dashboard.withAccount.categories', {accountId: $stateParams.accountId, categoryId: categoryId});
        }
      }
    };

    /**
     * Set the parent category.
     *
     * @param category
     *   Id of Category selected.
     * @param categories
     *  Collecion o categories
     */
    function setParentCategory(category, categories) {
      vm.parentCategory = (!!categories.list[category].depth) ? category : undefined;
    }

  });
