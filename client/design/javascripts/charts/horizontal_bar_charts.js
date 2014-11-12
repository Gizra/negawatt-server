(function() {

  $(function() {
    var d1_h, d2_h, d3_h, ds_h, i, previousPoint, showTooltip;
    showTooltip = function(x, y, contents, areAbsoluteXY) {
      var rootElt;
      rootElt = "body";
      return $("<div id=\"tooltip3\" class=\"tooltip\">" + contents + "</div>").css({
        position: "absolute",
        display: "none",
        top: y - 35,
        left: x - 5,
        "z-index": "9999",
        color: "#fff",
        "font-size": "11px",
        opacity: 0.8
      }).prependTo(rootElt).show();
    };
    previousPoint = void 0;
    d1_h = [];
    i = 0;
    while (i <= 3) {
      d1_h.push([parseInt(Math.random() * 30), i]);
      i += 1;
    }
    d2_h = [];
    i = 0;
    while (i <= 3) {
      d2_h.push([parseInt(Math.random() * 30), i]);
      i += 1;
    }
    d3_h = [];
    i = 0;
    while (i <= 3) {
      d3_h.push([parseInt(Math.random() * 30), i]);
      i += 1;
    }
    ds_h = new Array();
    ds_h.push({
      data: d1_h,
      bars: {
        horizontal: true,
        show: true,
        barWidth: 0.2,
        order: 1
      }
    });
    ds_h.push({
      data: d2_h,
      bars: {
        horizontal: true,
        show: true,
        barWidth: 0.2,
        order: 2
      }
    });
    ds_h.push({
      data: d3_h,
      bars: {
        horizontal: true,
        show: true,
        barWidth: 0.2,
        order: 3
      }
    });
    $.plot($("#placeholder1_hS"), ds_h, {
      grid: {
        hoverable: true
      }
    });
    return $("#placeholder1_hS").bind("plothover", function(event, pos, item) {
      var x, y;
      if (item) {
        if (previousPoint !== item.datapoint) {
          previousPoint = item.datapoint;
          $(".tooltip").remove();
          x = item.datapoint[0];
          if (item.series.bars.order) {
            i = 0;
            while (i < item.series.data.length) {
              if (item.series.data[i][3] === item.datapoint[0]) {
                x = item.series.data[i][0];
              }
              i++;
            }
          }
          y = item.datapoint[1];
          return showTooltip(item.pageX + 5, item.pageY + 5, x + " = " + y);
        }
      } else {
        $(".tooltip").remove();
        return previousPoint = null;
      }
    });
  });

}).call(this);
