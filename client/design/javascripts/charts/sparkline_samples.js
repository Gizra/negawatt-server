(function() {

  $(function() {
    var barChartDataset, colors, drawMouseSpeedDemo, initBarChart, initLineChart, initPieChart, lineChartDataset, tooltipLabels;
    colors = $.map(Theme.colors, function(item) {
      return item;
    });
    tooltipLabels = {
      names: {
        0: 'Automotive',
        1: 'Locomotive',
        2: 'Unmotivated',
        3: 'Three',
        4: 'Four',
        5: 'Five'
      }
    };
    initPieChart = function() {
      var width;
      width = $(".spark-pie").width();
      if (width > 200) {
        width = 200;
      }
      return $(".spark-pie").sparkline([55, 100, 220, 180], {
        type: 'pie',
        height: width,
        sliceColors: colors,
        tooltipFormat: '<span style="color: {{color}}">&#9679;</span> {{offset:names}} ({{percent.1}}%)',
        tooltipValueLookups: tooltipLabels
      });
    };
    initBarChart = function(data, object) {
      var barCount, barSpacing, barWidth, currentWidth, widthLeftForBars;
      currentWidth = object.width();
      barCount = data.length;
      barSpacing = 5;
      widthLeftForBars = currentWidth - (barCount - 1) * barSpacing;
      barWidth = widthLeftForBars / barCount;
      return object.sparkline(data, {
        type: "bar",
        barColor: Theme.colors.blue,
        height: 200,
        barWidth: barWidth,
        barSpacing: barSpacing,
        tooltipSuffix: "$ income received"
      });
    };
    barChartDataset = [4, 1, 5, 7, 9, 9, 8, 7, 6, 6, 4, 7, 8, 4, 3, 2, 2, 5, 6, 7];
    lineChartDataset = [6, 3, 8, 5, 8, 4, 3, 2, 7, 6, 6, 4, 7, 2, 5, 6, 7, 2, 4, 11];
    initLineChart = function() {
      return $(".spark-composite").sparkline(lineChartDataset, {
        composite: true,
        fillColor: false,
        lineColor: Theme.colors.red,
        width: "100%",
        height: '200',
        spotColor: Theme.colors.lightBlue,
        lineWidth: 3,
        maxSpotColor: Theme.colors.red,
        highlightSpotColor: Theme.colors.orange,
        highlightLineColor: Theme.colors.orange,
        chartRangeMin: 0,
        spotRadius: 4,
        drawNormalOnTop: false,
        tooltipSuffix: " orders sent"
      });
    };
    initBarChart(barChartDataset, $(".spark-composite"));
    initLineChart();
    initPieChart();
    $(window).resize(function() {
      initBarChart(barChartDataset, $(".spark-composite"));
      initLineChart();
      return initPieChart();
    });
    drawMouseSpeedDemo = function() {
      var lastmousetime, lastmousex, lastmousey, mdraw, mousetravel, mpoints, mpoints_max, mrefreshinterval;
      mrefreshinterval = 100;
      lastmousex = -1;
      lastmousey = -1;
      lastmousetime = void 0;
      mousetravel = 0;
      mpoints = [];
      mpoints_max = 30;
      $("html").mousemove(function(e) {
        var mousex, mousey;
        mousex = e.pageX;
        mousey = e.pageY;
        if (lastmousex > -1) {
          mousetravel += Math.max(Math.abs(mousex - lastmousex), Math.abs(mousey - lastmousey));
        }
        lastmousex = mousex;
        return lastmousey = mousey;
      });
      mdraw = function() {
        var md, pps, timenow;
        md = new Date();
        timenow = md.getTime();
        if (lastmousetime && lastmousetime !== timenow) {
          pps = Math.round(mousetravel / (timenow - lastmousetime) * 1000);
          mpoints.push(pps);
          if (mpoints.length > mpoints_max) {
            mpoints.splice(0, 1);
          }
          mousetravel = 0;
          $(".spark-mouse").sparkline(mpoints, {
            type: 'line',
            width: "100%",
            height: '200',
            chartRangeMin: 0,
            chartRangeMax: 3000,
            lineColor: Theme.colors.blue,
            fillColor: Theme.colors.lightBlue,
            spotColor: Theme.colors.lightBlue,
            lineWidth: 3,
            maxSpotColor: Theme.colors.red,
            highlightSpotColor: Theme.colors.orange,
            highlightLineColor: Theme.colors.orange,
            spotRadius: 4,
            drawNormalOnTop: false,
            tooltipSuffix: " pixels per second"
          });
        }
        lastmousetime = timenow;
        return setTimeout(mdraw, mrefreshinterval);
      };
      return setTimeout(mdraw, mrefreshinterval);
    };
    if ($(".spark-mouse").length > 0) {
      return drawMouseSpeedDemo();
    }
  });

}).call(this);
