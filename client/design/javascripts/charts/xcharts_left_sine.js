$(function(){
    var tt = document.createElement('div'),
        leftOffset = -($('html').css('padding-left').replace('px', '') + $('body').css('margin-left').replace('px', '')),
        topOffset = -32;
    tt.className = 'ex-tooltip';
    document.body.appendChild(tt);

    var data = {
        "xScale": "time",
        "yScale": "linear",
        "main": [
            {
                "className": ".pizza",
                "data": [
                    { "x": "2012-11-05", "y": 6 },
                    { "x": "2012-11-06", "y": 6 },
                    { "x": "2012-11-07", "y": 8 },
                    { "x": "2012-11-08", "y": 3 },
                    { "x": "2012-11-09", "y": 4 },
                    { "x": "2012-11-10", "y": 9 },
                    { "x": "2012-11-11", "y": 6 }
                ]
            }
        ]
    };
    var opts = {
        paddingLeft:15,
        paddingRight: 0,
        axisPaddingTop: 5,
        axisPaddingLeft: 5,
        dataFormatX: function (x) { return d3.time.format('%Y-%m-%d').parse(x); },
        tickFormatX: function (x) { return d3.time.format('%a')(x); },
        mouseover: function (d, i) {
            var pos = $(this).offset();
            $(tt).text(d3.time.format('%A')(d.x) + ': ' + d.y)
                .css({top: topOffset + pos.top, left: pos.left + leftOffset})
                .show();
        },
        "mouseout": function (x) { $(tt).hide(); }
    };

    if ($("#left-sidebar-chart").length > 0) {
        new xChart('line-dotted', data, '#left-sidebar-chart', opts);
    }

    if ($(".xcharts-line-dotted").length > 0) {
        new xChart('line-dotted', data, '.xcharts-line-dotted', opts);
    }


});
