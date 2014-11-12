$(function () {

    var getData = function() {
        var data = {
            "xScale": "ordinal",
            "yScale": "linear"
        };

        data.main = []
        var foods = $(["Beef", "Ham", "Bacon"]);
        $([1,2,3]).each(function(){

            var graphData = []

            foods.each(function(){
                graphData.push({
                    "x": this,
                    "y": getRandomInt(3,12)
                });
            });

            data.main.push({
                "className": ".food",
                "data": graphData
            })
        });

        return data;
    }


    if($(".xcharts-bar").length > 0) {
        var myChart = new xChart('bar', getData(), '.xcharts-bar', {axisPaddingTop: 5, paddingLeft: 15});
        $("#randomize-bar-chart").click(function(){
            myChart.setData(getData())
        });
    }

});
