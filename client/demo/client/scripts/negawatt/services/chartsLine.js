'use strict';

angular.module('app')
  .service('ChartLine', function ($q, moment) {
    var ChartLine = this;

    /**
     *  From the object getted from de server transforming to chart object format.
     *
     *  source object:
     *  --------------
     *
     *    data: {
     *      data: [
     *        {
     *          0: Object
     *          id: 38
     *          kwh: "10936"
     *          meter: Object
     *          min_power_factor: "0"
     *          rate_type: "flat"
     *          timestamp: "1356991200"
     *          type: "month"
     *        },
     *        ...
     *      ],
     *      total: {
     *        1: {
     *          kwh: "942"
     *        },
     *        2: {
     *          kwh: "803"
     *        }
     *        ...
     *      }
     *    }
     *
     *
     *  target object:
     *  --------------
     *
     *    datasets: [
     *      {
     *        label: 'My First dataset',
     *        fillColor: 'rgba(220,220,220,0.2)',
     *        strokeColor: 'rgba(220,220,220,1)',
     *        pointColor: 'rgba(220,220,220,1)',
     *        pointStrokeColor: '#fff',
     *        pointHighlightFill: '#fff',
     *        pointHighlightStroke: 'rgba(220,220,220,1)',
     *        data: [65, 59, 80, 81, 56]
     *      },
     *      {
     *        label: 'My Second dataset',
     *        fillColor: 'rgba(151,187,205,0.2)',
     *        strokeColor: 'rgba(151,187,205,1)',
     *        pointColor: 'rgba(151,187,205,1)',
     *        pointStrokeColor: '#fff',
     *        pointHighlightFill: '#fff',
     *        pointHighlightStroke: 'rgba(151,187,205,1)',
     *        data: [28, 48, 40, 19, 86, 27, 90]
     *      },
     *      ...
     *   ]
     *
     *
     * @param {data} data source object.
     * @returns {Array} - target data datasets.
     **/
    function transformDataToDatasets(data) {
      var datasets = [],
        values = [],
        totals = [],
        timestamp,
        series;

      // Transform total to an array.
      angular.forEach(data.total, function(item) {
        this.push(item);
      }, totals);

      // Get the year of the  timestamp first item.
      timestamp = moment.unix(data.data[0].timestamp).format('YYYY');

      // Build a series for a dataset from data or totals.
      series = (data.showTotals) ? totals : data.data;

      angular.forEach(series, function(item) {
        this.push(item.kwh);
      }, values);

      // This version only support charts with one line.
      datasets.push({
        label: timestamp,
        fillColor: 'rgba(151,187,205,0.2)',
        strokeColor: 'rgba(151,187,205,1)',
        pointColor: 'rgba(151,187,205,1)',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(151,187,205,1)',
        data: values
      });

      return datasets;
    }

    /**
    * Get the response data from the service electricity via controller report.
    *
    * @param {*} response
    * @returns {$q.promise}
    */
    this.getLineChart = function(response) {
      var deferred = $q.defer();
      var line = {};

      // Chart.js Data.
      line.data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'November', 'Dicember'],
        datasets: transformDataToDatasets(response.data)
      };

      // Chart.js Exmaple Options.
      line.options =  {

        // Sets the chart to be responsive
        responsive: true,

        ///Boolean - Whether grid lines are shown across the chart
        scaleShowGridLines : true,

        //String - Colour of the grid lines
        scaleGridLineColor : "rgba(0,0,0,.05)",

        //Number - Width of the grid lines
        scaleGridLineWidth : 1,

        //Boolean - Whether the line is curved between points
        bezierCurve : true,

        //Number - Tension of the bezier curve between points
        bezierCurveTension : 0.4,

        //Boolean - Whether to show a dot for each point
        pointDot : true,

        //Number - Radius of each point dot in pixels
        pointDotRadius : 4,

        //Number - Pixel width of point dot stroke
        pointDotStrokeWidth : 1,

        //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
        pointHitDetectionRadius : 20,

        //Boolean - Whether to show a stroke for datasets
        datasetStroke : true,

        //Number - Pixel width of dataset stroke
        datasetStrokeWidth : 2,

        //Boolean - Whether to fill the dataset with a colour
        datasetFill : true,

        // Function - on animation progress
        onAnimationProgress: function(){},

        // Function - on animation complete
        onAnimationComplete: function(){},

        //String - A legend template
        legendTemplate : '<ul class="tc-chart-js-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'
      };

      deferred.resolve(line);
      return deferred.promise;
    };

    /**
     * Append property show totals into the response data. This indicate to the data transformation
     * get the information from the total property an not the monthly data.
     *
     * @param response
     * @returns {$q.promise}
     */
    this.getLineChartTotals = function(response) {
      response.data.showTotals = true;
      return ChartLine.getLineChart(response);
    };

  });
