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
    $('#left-panel').height(height - 110);
    $('#group-access-tree').height(height - 110);

});


function drawChart(ChartType, Interval, chartData, chartDataColumn, datapoints, chartDivName, showLegend, startOfWeek)
{
    var chart = new AmCharts.AmSerialChart();

    if (showLegend == undefined)
    {
        showLegend = true;
    }

    var firstDayOfWeek = 0;

    switch (startOfWeek.value)
    {
        case "Sunday": firstDayOfWeek = 0; break;
        case "Monday": firstDayOfWeek = 1; break;
        case "Tuesday": firstDayOfWeek = 2; break;
        case "Wednesday": firstDayOfWeek = 3; break;
        case "Thursday": firstDayOfWeek = 4; break;
        case "Friday": firstDayOfWeek = 5; break;
        case "Saturday": firstDayOfWeek = 6; break;
    }

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
                    if (!isNaN(parseFloat(chartData[ctr2][chartDataColumn[ctr]]))) {
                        average = average + parseFloat(chartData[ctr2][chartDataColumn[ctr]]);
                    }
                    countOfValues++;
                }
            }

            if (countOfValues > 0) {
                average = roundToTwo(average / countOfValues);
            }

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

        if (showLegend) {
            var legend = new AmCharts.AmLegend();
            legend.markerType = "circle";
            legend.position = "bottom";
            //legend.marginRight = 10;
            legend.autoMargins = false;
            chart.addLegend(legend);
        }

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
        categoryAxis.firstDayOfWeek = firstDayOfWeek;

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
            case 4: categoryAxis.minPeriod = "WW"; break;
            case 5: categoryAxis.minPeriod = "MM"; break;
            case 6: categoryAxis.minPeriod = "YYYY"; break;
            
        }

        if (showLegend) {
            var legend = new AmCharts.AmLegend();
            legend.useGraphSettings = true;
            chart.addLegend(legend);
        }

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
    }

    //chart.export = {
    //    enabled: true,
    //    libs: {
    //        path: "Scripts/amcharts/plugins/export/libs/"
    //    },
    //    position: "bottom-right"
    //};


    //chart.export = {
    //    enabled: true,
    //    position: "bottom-right",
        //menu: [{
        //    label: "PDF + data",
        //    click: function () {
        //        this.capture({}, function () {
        //            var tableData = this.setup.chart.dataProvider;
        //            for (var ctr = 0; ctr < tableData.length; ctr++)
        //            {
        //                delete tableData[ctr].$$hashKey;
        //            }
        //            var tableBody = this.toArray({
        //                withHeader: true,
        //                data: tableData
        //            });

        //            var tableWidths = [];
        //            var content = [{
        //                image: "reference",
        //                fit: [523.28, 769.89]
        //            }];

        //            for (i in tableBody[0]) {
        //                tableWidths.push("*");
        //            }

        //            content.push({
        //                table: {
        //                    headerRows: 1,
        //                    widths: tableWidths,
        //                    body: tableBody
        //                },
        //                layout: 'lightHorizontalLines'
        //            });

        //            this.toPDF({
        //                content: content
        //            }, function (data) {
        //                this.download(data, "application/pdf", "amCharts.pdf");
        //            });
        //        });
        //    }
        //}]
    //}

    if (showLegend) {
        chart.export = {
            enabled: true,
            position: "bottom-right",
            libs: {
                path: "Scripts/amcharts/plugins/export/libs/"
            },
            menu: [{
                class: "export-main",
                label: "Export",
                menu: [{
                    label: "Download as ...",
                    menu: ["PNG", "JPG", "SVG", {
                        label: "PDF + data",
                        click: function () {
                            this.capture({}, function () {
                                var tableData = this.setup.chart.dataProvider;
                                for (var ctr = 0; ctr < tableData.length; ctr++) {
                                    delete tableData[ctr].$$hashKey;
                                }
                                var tableBody = this.toArray({
                                    withHeader: true,
                                    data: tableData
                                });

                                var tableWidths = [];
                                var content = [{
                                    image: "reference",
                                    fit: [523.28, 769.89]
                                }];

                                for (i in tableBody[0]) {
                                    tableWidths.push("*");
                                }

                                content.push({
                                    table: {
                                        headerRows: 1,
                                        widths: tableWidths,
                                        body: tableBody
                                    },
                                    layout: 'lightHorizontalLines'
                                });

                                this.toPDF({
                                    content: content
                                }, function (data) {
                                    this.download(data, "application/pdf", "amCharts.pdf");
                                });
                            });
                        }
                    }
                    ]
                }, {
                    label: "Save data ...",
                    menu: ["CSV", "XLSX", "JSON"]
                }, {
                    label: "Annotate",
                    action: "draw",
                    menu: [{
                        class: "export-drawing",
                        menu: [{
                            label: "Color ...",
                            menu: [{
                                class: "export-drawing-color export-drawing-color-black",
                                label: "Black",
                                click: function () {
                                    this.setup.fabric.freeDrawingBrush.color = "#000";
                                }
                            }, {
                                class: "export-drawing-color export-drawing-color-white",
                                label: "White",
                                click: function () {
                                    this.setup.fabric.freeDrawingBrush.color = "#fff";
                                }
                            }, {
                                class: "export-drawing-color export-drawing-color-red",
                                label: "Red",
                                click: function () {
                                    this.setup.fabric.freeDrawingBrush.color = "#f00";
                                }
                            }, {
                                class: "export-drawing-color export-drawing-color-green",
                                label: "Green",
                                click: function () {
                                    this.setup.fabric.freeDrawingBrush.color = "#0f0";
                                }
                            }, {
                                class: "export-drawing-color export-drawing-color-blue",
                                label: "Blue",
                                click: function () {
                                    this.setup.fabric.freeDrawingBrush.color = "#00f";
                                }
                            }]
                        }, "UNDO", "REDO", {
                            label: "Save as ...",
                            menu: ["PNG", "JPG", "SVG", {
                                label: "PDF + data",
                                click: function () {
                                    this.capture({}, function () {
                                        var tableData = this.setup.chart.dataProvider;
                                        for (var ctr = 0; ctr < tableData.length; ctr++) {
                                            delete tableData[ctr].$$hashKey;
                                        }
                                        var tableBody = this.toArray({
                                            withHeader: true,
                                            data: tableData
                                        });

                                        var tableWidths = [];
                                        var content = [{
                                            image: "reference",
                                            fit: [523.28, 769.89]
                                        }];

                                        for (i in tableBody[0]) {
                                            tableWidths.push("*");
                                        }

                                        content.push({
                                            table: {
                                                headerRows: 1,
                                                widths: tableWidths,
                                                body: tableBody
                                            },
                                            layout: 'lightHorizontalLines'
                                        });

                                        this.toPDF({
                                            content: content
                                        }, function (data) {
                                            this.download(data, "application/pdf", "amCharts.pdf");
                                        });
                                    });
                                }
                            }]
                        }, {
                            format: "PRINT",
                            label: "Print"
                        }, "CANCEL"]
                    }]
                }]
            }]
        }
    }

    chart.write(chartDivName);
}

function getRandomColor() {
    //var letters = 'ABCDE'.split('');
    //var color = '#';
    //for (var i=0; i<3; i++ ) {
    //    color += letters[Math.floor(Math.random() * letters.length)];
    //}
    //return color;

    var c = '';
    while (c.length < 6) {
        c += (Math.random()).toString(16).substr(-6).substr(-1);
    }
    return '#' + c;
}

function roundToTwo(num) {
    return +(Math.round(num + "e+2") + "e-2");
}