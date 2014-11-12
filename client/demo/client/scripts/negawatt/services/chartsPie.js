'use strict';

angular.module('app')
  .service('ChartPie', function ($q) {
    /**
     * Return object expected by the pieChart component.
     *
     * @returns {*} - data object.
     */
    this.mockPieChart = function() {
      var mock = {};

      // Set demo data.
      mock.data = [
        {
          label: "תאורת חוץ",
          color:'#F7464A',
          highlight: '#FF5A5E',
          value: 3126998
        },
        {
          label: "חינוך",
          color: '#46BFBD',
          highlight: '#5AD3D1',
          value: 2852161
        },
        {
          label: "עיריה",
          color: '#FDB45C',
          highlight: '#FFC870',
          value: 646544
        }, {
          label: "רווחה",
          color: '#46BFBD',
          highlight: '#5AD3D1',
          value: 312385
        }, {
          label: "שרותי דת",
          color: '#FDB45C',
          highlight: '#FFC870',
          value: 161725
        }, {
          label: "בריאות",
          color: '#FDB45C',
          highlight: '#FFC870',
          value: 79081
        }, {
          label: "בטחון",
          color: '#46BFBD',
          highlight: '#5AD3D1',
          value: 71611
        }, {
          label: "ספורט",
          color: '#FDB45C',
          highlight: '#FFC870',
          value: 46440
        }, {
          label: "עמותה",
          color: '#FDB45C',
          highlight: '#FFC870',
          value: 26378
        }
      ];

      // Chart.js Options
      mock.options =  {

        // Sets the chart to be responsive
        responsive: true,

        //Boolean - Whether we should show a stroke on each segment
        segmentShowStroke : true,

        //String - The colour of each segment stroke
        segmentStrokeColor : '#fff',

        //Number - The width of each segment stroke
        segmentStrokeWidth : 2,

        //Number - The percentage of the chart that we cut out of the middle
        percentageInnerCutout : 0, // This is 0 for Pie charts

        //Number - Amount of animation steps
        animationSteps : 100,

        //String - Animation easing effect
        animationEasing : 'easeOutBounce',

        //Boolean - Whether we animate the rotation of the Doughnut
        animateRotate : true,

        //Boolean - Whether we animate scaling the Doughnut from the centre
        animateScale : false,

        //String - A legend template
        legendTemplate : '<ul class="tc-chart-js-legend"><% for (var i=0; i<segments.length; i++){%><li><span style="background-color:<%=segments[i].fillColor%>"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>'

      };

      return mock;
    }


  });
