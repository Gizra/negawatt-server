$(function () {
    var data = [
        {
            "xScale":"ordinal",
            "comp":[],
            "main":[
                {
                    "className":".main.l1",
                    "data":[
                        { "y":15, "x":"2012-11-19T00:00:00" },
                        { "y":11, "x":"2012-11-20T00:00:00" },
                        { "y":8, "x":"2012-11-21T00:00:00" },
                        { "y":10, "x":"2012-11-22T00:00:00" },
                        { "y":1, "x":"2012-11-23T00:00:00" },
                        { "y":6, "x":"2012-11-24T00:00:00" },
                        { "y":8, "x":"2012-11-25T00:00:00" }
                    ]
                },{
                    "className":".main.l2",
                    "data":[
                        {"y":29,"x":"2012-11-19T00:00:00"},
                        {"y":33,"x":"2012-11-20T00:00:00"},
                        {"y":13,"x":"2012-11-21T00:00:00"},
                        {"y":16,"x":"2012-11-22T00:00:00"},
                        {"y":7,"x":"2012-11-23T00:00:00"},
                        {"y":18,"x":"2012-11-24T00:00:00"},
                        {"y":8,"x":"2012-11-25T00:00:00"}
                    ]
                }
            ],
            "type":"line-dotted",
            "yScale":"linear"
        },{
            "xScale":"ordinal",
            "comp":[],
            "main":[
                {
                    "className":".main.l1",
                    "data":[
                        {"y":12,"x":"2012-11-19T00:00:00"},
                        {"y":18,"x":"2012-11-20T00:00:00"},
                        {"y":8,"x":"2012-11-21T00:00:00"},
                        {"y":7,"x":"2012-11-22T00:00:00"},
                        {"y":6,"x":"2012-11-23T00:00:00"},
                        {"y":12,"x":"2012-11-24T00:00:00"},
                        {"y":8,"x":"2012-11-25T00:00:00"}
                    ]
                },{
                    "className":".main.l2",
                    "data":[
                        {"y":29,"x":"2012-11-19T00:00:00"},
                        {"y":33,"x":"2012-11-20T00:00:00"},
                        {"y":13,"x":"2012-11-21T00:00:00"},
                        {"y":16,"x":"2012-11-22T00:00:00"},
                        {"y":7,"x":"2012-11-23T00:00:00"},
                        {"y":18,"x":"2012-11-24T00:00:00"},
                        {"y":8,"x":"2012-11-25T00:00:00"}
                    ]
                }
            ],
            "type":"cumulative",
            "yScale":"linear"
        },{
            "xScale":"ordinal",
            "comp":[],
            "main":[
                {
                    "className":".main.l1",
                    "data":[
                        {"y":12,"x":"2012-11-19T00:00:00"},
                        {"y":18,"x":"2012-11-20T00:00:00"},
                        {"y":8,"x":"2012-11-21T00:00:00"},
                        {"y":7,"x":"2012-11-22T00:00:00"},
                        {"y":6,"x":"2012-11-23T00:00:00"},
                        {"y":12,"x":"2012-11-24T00:00:00"},
                        {"y":8,"x":"2012-11-25T00:00:00"}
                    ]
                },{
                    "className":".main.l2",
                    "data":[
                        {"y":29,"x":"2012-11-19T00:00:00"},
                        {"y":33,"x":"2012-11-20T00:00:00"},
                        {"y":13,"x":"2012-11-21T00:00:00"},
                        {"y":16,"x":"2012-11-22T00:00:00"},
                        {"y":7,"x":"2012-11-23T00:00:00"},
                        {"y":18,"x":"2012-11-24T00:00:00"},
                        {"y":8,"x":"2012-11-25T00:00:00"}]
                }
            ],
            "type":"bar",
            "yScale":"linear"
        }
    ];

    var order = [0, 1, 0, 2],
        i = 0,
        xFormat = d3.time.format('%A'),
        rotateTimer,
        chart,
        t = 3500;

    if ($("#xchart-sine").length > 0) {
        chart = new xChart('bar', data[order[i]], '#xchart-sine', {
            axisPaddingTop: 5,
            paddingLeft: 30,
            dataFormatX: function (x) { return new Date(x); },
            tickFormatX: function (x) { return d3.time.format('%a')(x); }
        });

        rotateTimer = setTimeout(rotateChart, t);
    }

    function updateChart(i) {
        chart.setData(data[i]);
    }

    function rotateChart() {
        i += 1;
        i = (i >= order.length) ? 0 : i;
        updateChart(order[i]);
        rotateTimer = setTimeout(rotateChart, t);
    }

});
