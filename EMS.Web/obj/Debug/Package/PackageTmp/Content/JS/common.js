function getUrl(url) {
    return baseUrl + url;
}

function trimWhiteSpaces(element) {
    var register = $(element);
    var registerName = register.val();
    register.val($.trim(registerName));
}

$(window).resize(function () {
    
    var height = $(window).height();
    $('#left-panel').height(height - 150);
    $('#group-access-tree').height(height - 200);

});


function drawChart(ChartType, Interval, chartData, chartDataColumn, datapoints, chartDivName)
{
    var chart = new AmCharts.AmSerialChart();

    if ((ChartType == 4) || (ChartType == 6) || (ChartType == 10) || (ChartType == 12)) {

        var chartDataPie = [];
        var benchmark = false;

        for (var ctr = 1; ctr < chartDataColumn.length; ctr++)
        {
            var average = 0;
            var countOfValues = 0;
            var color = "";

            for (var ctr2 = 0; ctr2 < chartData.length; ctr2++)
            {
                if (chartData[ctr2][chartDataColumn[ctr]] != "")
                {
                    average = average + chartData[ctr2][chartDataColumn[ctr]];
                    countOfValues++;
                }
            }

            average = roundToTwo(average / countOfValues);

            if (benchmark) {
                color = getRandomColor();
            }
            else {
                color = datapoints[ctr - 1].Color;
            }
            
            chartDataPie.push({ "datapoint": chartDataColumn[ctr], "average": average, "color": color });

            if (ctr >= datapoints.length) {
                benchmark = true;
            }
        }

        chart = new AmCharts.AmPieChart();
        chart.dataProvider = chartDataPie;
        chart.valueField = "average";
        chart.titleField = "datapoint";
        chart.colorField = "color";
        chart.balloonText = "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>";
        chart.labelsEnabled = false;
        chart.autoMargins = false;
        chart.marginTop = 20;
        chart.marginBottom = 30;
        chart.marginLeft = 20;
        chart.marginRight = 20;

        chart.pullOutRadius = 50;
        var legend = new AmCharts.AmLegend();
        legend.markerType = "circle";
        legend.position = "bottom";
        //legend.marginRight = 10;
        legend.autoMargins = false;
        chart.addLegend(legend);

        switch (ChartType) {
            case 4: break;
            case 6: chart.angle = 30; chart.depth3D = 15; break;
            case 10: chart.startDuration = 3; break;
            case 12: chart.angle = 30; chart.depth3D = 15; chart.startDuration = 3; break;
        }
    }
    else {
        chart.dataProvider = chartData;
        chart.categoryField = "Date";
        chart.dataDateFormat = "MM/DD/YYYY JJ:NN";
        chart.chartScrollbar = {};
        chart.pathToImages = "Scripts/amcharts/images/"
        chart.theme = "none";

        var chartCursor = new AmCharts.ChartCursor();
        chartCursor.cursorPosition = "mouse";
        chart.addChartCursor(chartCursor);

        var benchmark = false;

        if (chartDataColumn != undefined) {
            for (i = 1; i < chartDataColumn.length; i++) {

                var graph = new AmCharts.AmGraph();
                graph.valueField = chartDataColumn[i];
                graph.balloonText = "[[category]]: <b>[[value]]</b>";
                if (benchmark) {
                    graph.lineColor = getRandomColor();
                }
                else {
                    graph.lineColor = datapoints[i - 1].Color;
                }
                graph.title = chartDataColumn[i];

                switch (ChartType) {
                    //$scope.chartTypes = 
                    //[{ "Name": "Area", "value": 1 },
                    //{ "Name": "Bar", "value": 2 },
                    //{ "Name": "Line", "value": 3 },
                    //{ "Name": "Pie", "value": 4 },
                    //{ "Name": "Bar 3D", "value": 5 },
                    //{ "Name": "Pie 3D", "value": 6 },
                    //{ "Name": "Animated Area", "value": 7 },
                    //{ "Name": "Animated Bar", "value": 8 },
                    //{ "Name": "Animated Line", "value": 9 },
                    //{ "Name": "Animated Pie", "value": 10 },
                    //{ "Name": "Animated Bar 3D", "value": 11 },
                    //{ "Name": "Animated Pie 3D", "value": 12 }];

                    case 1: graph.type = "line"; graph.fillAlphas = 1; break;
                    case 2: graph.type = "column"; graph.fillAlphas = 1; break;
                    case 3: graph.type = "line"; break;
                        //case 4: graph.type = "pie"; break;
                    case 5: graph.type = "column"; graph.fillAlphas = 1; chart.angle = 30; chart.depth3D = 15; break;
                        //case 6: graph.type = "pie"; chart.angle = 30; chart.depth3D = 15; break;
                    case 7: graph.type = "line"; graph.fillAlphas = 1; chart.startDuration = 3; break;
                    case 8: graph.type = "column"; graph.fillAlphas = 1; chart.startDuration = 3; break;
                    case 9: graph.type = "line"; chart.startDuration = 3; break;
                        //case 10: graph.type = "pie"; chart.startDuration = 1; break;
                    case 11: graph.type = "column"; chart.angle = 30; graph.fillAlphas = 1; chart.depth3D = 15; chart.startDuration = 3; break;
                        //case 12: graph.type = "pie"; chart.angle = 30; chart.depth3D = 15; chart.startDuration = 1; break;
                }

                chart.addGraph(graph);

                if (i >= datapoints.length) {
                    benchmark = true;
                }
            }
        }


        var categoryAxis = chart.categoryAxis;
        //categoryAxis.autoGridCount = false;
        //categoryAxis.gridCount = chartData.length;
        //categoryAxis.gridPosition = "start";
        categoryAxis.labelRotation = 90;
        categoryAxis.parseDates = true;
        categoryAxis.minorGridEnabled = true;

        switch (Interval) {

            //$scope.logIntervals = [{ "Name": "Minute", "value": 1 },
            //    { "Name": "Hour", "value": 2 },
            //    { "Name": "Day", "value": 3 },
            //    { "Name": "Week", "value": 4 },
            //    { "Name": "Month", "value": 5 },
            //    { "Name": "Year", "value": 6 }];

            case 1: categoryAxis.minPeriod = "mm"; break;
            case 2: categoryAxis.minPeriod = "hh"; break;
            case 3: categoryAxis.minPeriod = "DD"; break;
            case 4: categoryAxis.minPeriod = "DD"; break;
            case 5: categoryAxis.minPeriod = "MM"; break;
            case 6: categoryAxis.minPeriod = "YYYY"; break;
            
        }

        var legend = new AmCharts.AmLegend();
        legend.useGraphSettings = true;
        chart.addLegend(legend);

        //chart.amExport = {
        //    bottom: 0,
        //    right: 0,
        //    exportJPG: true,
        //    exportPNG: true,
        //    exportSVG: true,
        //    exportPDF: true,
        //    userCFG: {
        //        menuTop: 'auto',
        //        menuLeft: 'auto',
        //        menuRight: '0px',
        //        menuBottom: '0px',
        //        legendPosition: "bottom",
        //        removeImagery: true
        //    }
        //};

        chart.export = {
            enabled: true,
            libs: {
                path: "Scripts/amcharts/plugins/export/libs/"
            },
            position: "bottom-right"
        };
    }

    chart.write(chartDivName);
}

function getRandomColor() {
    var letters = 'ABCDE'.split('');
    var color = '#';
    for (var i=0; i<3; i++ ) {
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}

function roundToTwo(num) {
    return +(Math.round(num + "e+2") + "e-2");
}