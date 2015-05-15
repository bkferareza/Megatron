app.controller('ChartController', function ($scope, toastr, datapointsFactory, CurrentUser, chartFactory) {

    //variables
    $scope.list = [];
    $scope.datapoint = {};
    $scope.variableTree = [];
    $scope.selected = [];
    $scope.chart = {};
    $scope.XVALUE = "";
    $scope.XVALUE2 = "";
    $scope.chartData = [];
    $scope.chartDataColumn = [];
    $scope.closed = false;

    $scope.loggedUser = CurrentUser.getUserInfo();
    $scope.loggedUser.UserId = $scope.loggedUser.ID;
    $scope.currentIndex = 0;

    $scope.chartWizard = function () {

        $scope.chart = {};
        $scope.selected = [];
    }

    $scope.chartWizard();
    //datapointsFactory.getDatapoints()
    //   .then(function (result) {
    //       $scope.list = result;
    //   }
    //   );
    $('#chartModal').on('hidden.bs.modal', function () {
        $scope.list = [];
        $scope.selected = [];
        $scope.chart = {};
        $scope.XVALUE = "";
        $scope.XVALUE2 = "";
        $scope.chartData = [];
        $scope.chartDataColumn = [];
        $scope.closed = false;
        $scope.currentIndex = 0;
       // $(this).data('bs.modal', null);
    });

    $('#myCarousel').on('slid.bs.carousel', function () {
        $scope.currentIndex = $scope.currentIndex + 1;
       
    });

    $scope.CloseWizard = function()
    {
        $scope.closed = true;
        if ($scope.currentIndex > 0)
        {
            $('.carousel').carousel(0);
            $('#myCarousel').on('slid.bs.carousel', function () {
                if ($scope.closed)
                    $('#chartModal').modal('hide');
            });
        }
        else
        {
                $('#chartModal').modal('hide');
        }
        
       
       
    }

    datapointsFactory.getVariableTree($scope.loggedUser.UserId)
 .then(function (result) {
     var data = [];
     data.push(result);
     $scope.variableTree = data;
 });

    function removeAllBlankOrNull(JsonObj) {
        $.each(JsonObj, function (key, value) {
            if (value === "" || value === null) {
                delete JsonObj[key];
            } else if (typeof (value) === "object") {
                JsonObj[key] = removeAllBlankOrNull(value);
            }
        });
        return JsonObj;
    }

    function getCurrentDate() {
        var currentDate = new Date();
        return currentDate;
    }
    $scope.year = getCurrentDate().getFullYear();
    $scope.currentMonth = getCurrentDate().getMonth();
    $scope.dayNumber = Date.getDaysInMonth($scope.year, $scope.currentMonth);
    $scope.pattern = "/^[1-9]$|^[1-2]\d$|^3[0-1]$/";

    $scope.modifyDataPoint = function (datapoint) {
        if (datapoint.ChildVariables == null) {
            if (!(isExist(datapoint, $scope.selected))) {
                if (datapoint.Type != 1)
                    $scope.selected.push(datapoint);
            }
            else {
                var index = $scope.selected.indexOf(datapoint);
                $scope.selected.splice(index, 1);
            }


        }
        else {

            datapoint.ChildVariables.forEach($scope.modifyDataPoint);
        }


    }

    function isExist(item, array) {
        var index = array.length;

        for (i = 0; i < array.length; i++) {
            if (item.ID == array[i].ID) {
                return true;
            }
        }
        return false
    }

    $scope.showToggle = function (items) {
        var variableTree = items.$modelValue;

        if (variableTree.ChildVariables != null) {
            return variableTree.ChildVariables.length > 0;
        }

        return false;
    }

    $scope.parameters = {
        dragEnabled: false,
        emptyPlaceholderEnabled: false,
        maxDepth: 10,
        dragDelay: 0,
        dragDistance: 0,
        lockX: false,
        lockY: false,
        boundTo: '',
        spacing: 20,
        coverage: 50,
        //cancelKey: 'esc',
        //copyKey: 'shift',
        //selectKey: 'ctrl',
        enableExpandOnHover: true,
        expandOnHover: 500,
    };

    //Selection
    $scope.logIntervals = [{ "Name": "Minute", "value": 1 },
                        { "Name": "Hour", "value": 2 },
                        { "Name": "Day", "value": 3 },
                        { "Name": "Week", "value": 4 },
                        { "Name": "Month", "value": 5 },
                          { "Name": "Year", "value": 6 }];

    $scope.logIntervals2 = [{ "Name": "Minute", "value": 1 },
          { "Name": "Hour", "value": 2 },
          { "Name": "Day", "value": 3 },
          { "Name": "Week", "value": 4 },
          { "Name": "Month", "value": 5 },
            { "Name": "Year", "value": 6 }];

    $scope.chartTypes = [{ "Name": "Area", "value": 1 },
                         { "Name": "Bar", "value": 2 },
                         { "Name": "Line", "value": 3 },
                            { "Name": "Pie", "value": 4 },
                            { "Name": "Bar 3D", "value": 5 },
                            { "Name": "Pie 3D", "value": 6 },
                            { "Name": "Animated Area", "value": 7 },
                            { "Name": "Animated Bar", "value": 8 },
                            { "Name": "Animated Line", "value": 9 },
                            { "Name": "Animated Pie", "value": 10 },
                            { "Name": "Animated Bar 3D", "value": 11 },
                            { "Name": "Animated Pie 3D", "value": 12 }];

    $scope.viewTypes = [{ "Name": "Single Chart", "value": 1 },
                        { "Name": "Dual Chart", "value": 2 },
                        { "Name": "Dual Chart Compare", "value": 3 }, ];

    $scope.queryModes = [{ "Name": "Single Data Point", "value": 1 },
                         { "Name": "Group Data Point", "value": 2 }];

    $scope.days = [{ "Name": "Sunday", "Tag": "S", "Checked": false, "value": 1 },
                    { "Name": "Monday", "Tag": "M", "Checked": false, "value": 2 },
                    { "Name": "Tuesday", "Tag": "T", "Checked": false, "value": 3 },
                    { "Name": "Wednesday", "Tag": "W", "Checked": false, "value": 4 },
                    { "Name": "Thursday", "Tag": "H", "Checked": false, "value": 5 },
                    { "Name": "Friday", "Tag": "F", "Checked": false, "value": 6 },
                    { "Name": "Saturday", "Tag": "S", "Checked": false, "value": 7 }];

    $scope.rangeOptions = [{ "Name": "Current Hour", "value": 1 },
                           { "Name": "Current Day", "value": 2 },
                           { "Name": "Current Week", "value": 3 },
                           { "Name": "Current Month", "value": 4 },
                           { "Name": "Current Year", "value": 5 },
                           { "Name": "Last X Hour(s)", "value": 6 },
                           { "Name": "Last X Day(s)", "value": 7 },
                           { "Name": "Last X Week(s)", "value": 8 },
                           { "Name": "Last X Month(s)", "value": 9 },
                           { "Name": "Last X Year(s)", "value": 10 }];

    $scope.aggregateOptions = [{ "Name": "Average", "value": 1 },
        { "Name": "Min Select", "value": 2 },
        { "Name": "Max Select", "value": 3 },
        { "Name": "Summation", "value": 4 },
        { "Name": "Last Value", "value": 5 },
        { "Name": "Specific", "value": 6 }];
    $scope.aggregateOptions2 = [{ "Name": "Average", "value": 1 },
                                { "Name": "Min Select", "value": 2 },
                                { "Name": "Max Select", "value": 3 },
                                { "Name": "Summation", "value": 4 },
                                { "Name": "Last Value", "value": 5 }];

    $scope.months = [{ "Name": "January", "value": 1 },
                    { "Name": "February", "value": 2 },
                    { "Name": "March", "value": 3 },
                    { "Name": "April", "value": 4 },
                    { "Name": "May", "value": 5 },
                    { "Name": "June", "value": 6 },
                    { "Name": "July", "value": 7 },
                    { "Name": "August", "value": 8 },
                    { "Name": "September", "value": 9 },
                    { "Name": "October", "value": 10 },
                    { "Name": "November", "value": 11 },
                    { "Name": "December", "value": 12 }];


    //Switches
    $scope.chartWizardTool = false;
    $scope.weeklyInterval = false;
    $scope.createChart = true;
    $scope.viewChart = false;
    $scope.showNext = false;
    $scope.showRangeOption = false;
    $scope.showRangeOptionValue = false;
    $scope.showWeeks = false;
    $scope.showHours = false;
    $scope.showMinutes = false;
    $scope.showDays = false;
    $scope.showMonths = false;
    $scope.showYears = false;
    $scope.showNextChartName = false;
    $scope.showNextDataPoints = false;
    $scope.savebutton = false;
    $scope.showNextTimeRange = true;
    $scope.showNextBenchmark = true;
    $scope.enableNumericFunctions = true;
    $scope.xvalueWarning = false;
    $scope.daysWarning = false;
    $scope.hoursWarning = false;
    $scope.minutesWarning = false;
    $scope.showAggregateSpecific = false;
    $scope.showNextSpecificAggregate = false;
    $scope.showXValueTimeRange = false;
    $scope.showXValueBenchmark = false;

    //watches
    $scope.$watch('chart.Interval', function (value) {
        if (value == 4)
            $scope.weeklyInterval = true;
        else
            $scope.weeklyInterval = false;

        value = value - 1;
        if (value == 0) // minutes
        {
            $scope.showWeeks = false;
            $scope.showHours = false;
            $scope.showDays = false;
            $scope.showMinutes = true;
            $scope.showMonths = false;
            $scope.enableNumericFunctions = true;


        }
        if (value == 1) // hour
        {
            $scope.showWeeks = false;
            $scope.showHours = false;
            $scope.showDays = false;
            $scope.showMinutes = true;
            $scope.showMonths = false;
            $scope.enableNumericFunctions = true;
            $scope.showNextSpecificAggregate = false;

        }
        else if (value == 2) //day
        {
            $scope.showWeeks = false;
            $scope.showHours = true;
            $scope.showDays = false;
            $scope.showMinutes = true;
            $scope.enableNumericFunctions = true;
            $scope.showMonths = false;
            $scope.showNextSpecificAggregate = false;


        }
        else if (value == 3) // week
        {

            $scope.showWeeks = true;
            $scope.showHours = true;
            $scope.showDays = false;
            $scope.showMinutes = true;
            $scope.showMonths = false;
            $scope.enableNumericFunctions = true;
            $scope.showNextSpecificAggregate = false;




        }
        else if (value == 4) // month
        {

            $scope.showHours = true;
            $scope.showMinutes = true;
            $scope.showWeeks = false;
            $scope.showDays = true;
            $scope.showMonths = false;
            $scope.enableNumericFunctions = true;
            $scope.showNextSpecificAggregate = false;



        }

        else if (value == 5)//year
        {

            $scope.showHours = true;
            $scope.showMinutes = true;
            $scope.showWeeks = false;
            $scope.showDays = true;
            $scope.showMonths = true;
            $scope.enableNumericFunctions = false;
            $scope.showNextSpecificAggregate = false;



        }
        if (value == 6) //x hour
        {
            $scope.showWeeks = false;
            $scope.showHours = false;
            $scope.showDays = false;
            $scope.showMinutes = true;
            $scope.showMonths = false;
            $scope.showNextSpecificAggregate = false;



        }
        else if (value == 7) // x day
        {
            $scope.showWeeks = false;
            $scope.showHours = true;
            $scope.showDays = false;
            $scope.showMinutes = true;
            $scope.showMonths = false;
            $scope.showNextSpecificAggregate = false;



        }
        else if (value == 8) // x week
        {
            $scope.showWeeks = true;
            $scope.showHours = true;
            $scope.showDays = false;
            $scope.showMinutes = true;
            $scope.showMonths = false;
            $scope.showNextSpecificAggregate = false;


        }
        else if (value == 9) // x month
        {
            $scope.showWeeks = false;
            $scope.showHours = true;
            $scope.showDays = true;
            $scope.showMinutes = true;
            $scope.showMonths = false;
            $scope.enableNumericFunctions = true;
            $scope.showNextSpecificAggregate = false;



        }
        else if (value == 10) // x year
        {
            $scope.showWeeks = false;
            $scope.showHours = true;
            $scope.showDays = true;
            $scope.showMinutes = true;
            $scope.showMonths = true;
            $scope.enableNumericFunctions = false;
            $scope.showNextSpecificAggregate = false;



        }

        if ($scope.chart.AggregateOptionNormal == 6 && $scope.chart.Interval != 1) {
            $scope.showAggregateSpecific = true;
            $scope.showNextSpecificAggregate = false;
        }
        else {
            $scope.showAggregateSpecific = false;
            $scope.showNextSpecificAggregate = true;
        }

    });

    $scope.$watch('chart.RangeType', function (value) {
        if (value == 'Fixed') {
            $scope.showNext = true;
            $scope.showRangeOption = false;
            $scope.logIntervals = [{ "Name": "Minute", "value": 1 },
                      { "Name": "Hour", "value": 2 },
                      { "Name": "Day", "value": 3 },
                      { "Name": "Week", "value": 4 },
                      { "Name": "Month", "value": 5 },
                        { "Name": "Year", "value": 6 }];
        }
        else if (value == 'Repeated') {
            $scope.showRangeOption = true;
            $scope.showNext = true;
            $scope.chart.RangeFrom = null;
            $scope.chart.RangeTo = null;
        }


    });

    $scope.$watch('chart.RangeOption', function (value) {

        if (value == undefined) {
            $scope.showNextTimeRange = false;
            $scope.showRangeOptionValue = false;
            $scope.showWeeks = false;
        }
        else if (value < 6) {
            $scope.showNextTimeRange = true;
            $scope.showRangeOptionValue = false;
            $scope.enableNumericFunctions = true;
            $scope.showWeeks = false;
        }
        else {
            $scope.showRangeOptionValue = true;
            $scope.enableNumericFunctions = true;
            $scope.showNextTimeRange = false;

        }


        $scope.chart.RangeXValue = "";
        $scope.chart.Month = "";
        $scope.chart.Day = "";
        $scope.chart.Hours = "";
        $scope.chart.Minutes = "";

        if (value == 1) // hour
        {
            $scope.showWeeks = false;
            $scope.showHours = false;
            $scope.showDays = false;
            $scope.showMinutes = true;
            $scope.showMonths = false;
            $scope.enableNumericFunctions = true;
            $scope.showNextTimeRange = true;
            $scope.logIntervals = [{ "Name": "Minute", "value": 1 },
                      { "Name": "Hour", "value": 2 }];

        }
        else if (value == 2) //day
        {
            $scope.showWeeks = false;
            $scope.showHours = true;
            $scope.showDays = false;
            $scope.showMinutes = true;
            $scope.enableNumericFunctions = true;
            $scope.showMonths = false;
            $scope.showNextTimeRange = true;
            $scope.logIntervals = [{ "Name": "Minute", "value": 1 },
                      { "Name": "Hour", "value": 2 },
                      { "Name": "Day", "value": 3 }];

        }
        else if (value == 3) // week
        {

            $scope.showWeeks = true;
            $scope.showHours = true;
            $scope.showDays = false;
            $scope.showMinutes = true;
            $scope.showMonths = false;
            $scope.enableNumericFunctions = true;
            $scope.showNextTimeRange = true;
            $scope.logIntervals = [{ "Name": "Minute", "value": 1 },
                  { "Name": "Hour", "value": 2 },
                  { "Name": "Day", "value": 3 },
                  { "Name": "Week", "value": 4 }];


        }
        else if (value == 4) // month
        {

            $scope.showHours = true;
            $scope.showMinutes = true;
            $scope.showWeeks = false;
            $scope.showDays = true;
            $scope.showMonths = false;
            $scope.enableNumericFunctions = true;
            $scope.showNextTimeRange = true;
            $scope.logIntervals = [{ "Name": "Minute", "value": 1 },
                  { "Name": "Hour", "value": 2 },
                  { "Name": "Day", "value": 3 },
                  { "Name": "Week", "value": 4 },
                  { "Name": "Month", "value": 5 }];

        }

        else if (value == 5)//year
        {

            $scope.showHours = true;
            $scope.showMinutes = true;
            $scope.showWeeks = false;
            $scope.showDays = true;
            $scope.showMonths = true;
            $scope.enableNumericFunctions = false;
            $scope.showNextTimeRange = true;
            $scope.logIntervals = [{ "Name": "Minute", "value": 1 },
                  { "Name": "Hour", "value": 2 },
                  { "Name": "Day", "value": 3 },
                  { "Name": "Week", "value": 4 },
                  { "Name": "Month", "value": 5 },
                    { "Name": "Year", "value": 6 }];

        }
        if (value == 6) //x hour
        {
            $scope.showWeeks = false;
            $scope.showHours = false;
            $scope.showDays = false;
            $scope.showMinutes = true;
            $scope.showMonths = false;
            $scope.showXValueTimeRange = true;
            $scope.XVALUE = 'Hours';
            $scope.logIntervals = [{ "Name": "Minute", "value": 1 },
                      { "Name": "Hour", "value": 2 }];

        }
        else if (value == 7) // x day
        {
            $scope.showWeeks = false;
            $scope.showHours = true;
            $scope.showDays = false;
            $scope.showMinutes = true;
            $scope.showMonths = false;
            $scope.showXValueTimeRange = true;
            $scope.XVALUE = 'Days';
            $scope.logIntervals = [{ "Name": "Minute", "value": 1 },
                      { "Name": "Hour", "value": 2 },
                      { "Name": "Day", "value": 3 }];

        }
        else if (value == 8) // x week
        {
            $scope.showWeeks = true;
            $scope.showHours = true;
            $scope.showDays = false;
            $scope.showMinutes = true;
            $scope.showMonths = false;
            $scope.showXValueTimeRange = true;
            $scope.XVALUE = 'Weeks';
            $scope.logIntervals = [{ "Name": "Minute", "value": 1 },
                      { "Name": "Hour", "value": 2 },
                      { "Name": "Day", "value": 3 },
                      { "Name": "Week", "value": 4 }];
        }
        else if (value == 9) // x month
        {
            $scope.showWeeks = false;
            $scope.showHours = true;
            $scope.showDays = true;
            $scope.showMinutes = true;
            $scope.showMonths = false;
            $scope.enableNumericFunctions = true;
            $scope.showXValueTimeRange = true;
            $scope.XVALUE = 'Months';
            $scope.logIntervals = [{ "Name": "Minute", "value": 1 },
                  { "Name": "Hour", "value": 2 },
                  { "Name": "Day", "value": 3 },
                  { "Name": "Week", "value": 4 },
                  { "Name": "Month", "value": 5 }];

        }
        else if (value == 10) // x year
        {
            $scope.showWeeks = false;
            $scope.showHours = true;
            $scope.showDays = true;
            $scope.showMinutes = true;
            $scope.showMonths = true;
            $scope.enableNumericFunctions = false;
            $scope.showXValueTimeRange = true;
            $scope.XVALUE = 'Years';
            $scope.logIntervals = [{ "Name": "Minute", "value": 1 },
                 { "Name": "Hour", "value": 2 },
                 { "Name": "Day", "value": 3 },
                 { "Name": "Week", "value": 4 },
                 { "Name": "Month", "value": 5 },
                   { "Name": "Year", "value": 6 }];

        }


    });

    $scope.$watch('chart.RangeXValue', function (value) {
        if (value != undefined) {
            if (value != null) {
                if (value != 0) {
                    $scope.showNextTimeRange = true;
                    $scope.xvalueWarning = false;
                }
                else {
                    $scope.showNextTimeRange = false;

                }

            }
            else {
                $scope.showNextTimeRange = false;

            }
        }
        else {
            $scope.showNextTimeRange = false;

        }


        if ($scope.XVALUE == 'Years') {
            $scope.year = getCurrentDate().getFullYear();
            $scope.year = $scope.year - value;
            $scope.dayNumber = Date.getDaysInMonth($scope.year, $scope.currentMonth);

            if ($scope.chart.Day > $scope.dayNumber)
                $scope.daysWarning = true;
            else
                $scope.daysWarning = false;
        }

        if (value > 1000) {
            $scope.xvalueWarning = true;
            $scope.showNextTimeRange = false;
        }


    });

    $scope.$watch('chart.Month', function (value) {

        if (value != undefined) {
            $scope.currentMonth = value.value - 1;
            $scope.enableNumericFunctions = true;
            $scope.dayNumber = Date.getDaysInMonth($scope.year, $scope.currentMonth);
        }

        else
            $scope.enableNumericFunctions = false;

        if ($scope.XVALUE == 'Years') {
            $scope.dayNumber = Date.getDaysInMonth($scope.year, $scope.currentMonth);
        }

        if ($scope.chart.Day > $scope.dayNumber)
            $scope.daysWarning = true;
        else
            $scope.daysWarning = false;


    });

    $scope.$watch('chart.Year', function (value) {
        $scope.year = value;
        $scope.dayNumber = Date.getDaysInMonth($scope.year, $scope.currentMonth);
        if ($scope.chart.RangeFrom != null && $scope.chart.RangeTo) {
            $scope.showNextSpecificAggregate = true;
        }
    });

    $scope.$watch('chart.Name', function (value) {
        if (value != undefined && value != null && value != "") {
            $scope.showNextChartName = true;
        }
        else
            $scope.showNextChartName = false;
        if ($scope.chart.RangeFrom != null && $scope.chart.RangeTo) {
            $scope.showNextTimeRange = true;
        }

    });

    $scope.$watch('selected', function (value) {
        if (value.length != null || value.length > 0) {
            $scope.showNextDataPoints = true;
        }
        else
            $scope.showNextDataPoints = false;
    });

    $scope.$watch('chart.RangeFrom', function (value) {
        if (value == undefined) {
            $scope.showNextTimeRange = false;
            //toastr.error("Invalid input for hours");
        }
        else {
            if (value < $scope.chart.RangeTo)
                $scope.showNextTimeRange = true;
            else
                $scope.showNextTimeRange = false;
        }

    });

    $scope.$watch('chart.RangeTo', function (value) {
        if (value == undefined) {
            $scope.showNextTimeRange = false;
            //toastr.error("Invalid input for hours");
        }
        else {
            if (value > $scope.chart.RangeFrom)
                $scope.showNextTimeRange = true;
            else
                $scope.showNextTimeRange = false;
        }


    });

    $scope.$watch('chart.BenchmarkFrom', function (value) {
        if (value == undefined) {
            $scope.showNextBenchmark = false;
            //toastr.error("Invalid input for hours");
        }
        else {
            if (value < $scope.chart.BenchmarkTo)
                $scope.showNextBenchmark = true;
            else
                $scope.showNextBenchmark = false;
        }
    });

    $scope.$watch('chart.BenchmarkTo', function (value) {
        if (value == undefined) {
            $scope.showNextBenchmark = false;
            //toastr.error("Invalid input for hours");
        }
        else {
            if (value > $scope.chart.BenchmarkFrom)
                $scope.showNextBenchmark = true;
            else
                $scope.showNextBenchmark = false;
        }
    });

    $scope.$watch('chart.Day', function (value) {
        if (value == undefined || value > $scope.dayNumber) {
            $scope.showNextSpecificAggregate = false;
            //toastr.error("Invalid input for hours");

        }
        else {
            $scope.showNextSpecificAggregate = validateTime($scope.chart.RangeXValue, $scope.chart.Day, $scope.chart.Hours, $scope.chart.Minutes);


        }

        if (value > $scope.dayNumber)
            $scope.daysWarning = true;
        else
            $scope.daysWarning = false;

        if ($scope.chart.RangeFrom != null && $scope.chart.RangeTo) {
            $scope.showNextSpecificAggregate = true;
        }


    });

    $scope.$watch('chart.Hours', function (value) {
        if (value == undefined || value > 23) {
            $scope.showNextSpecificAggregate = false;

            //toastr.error("Invalid input for hours");
        }
        else {
            $scope.showNextSpecificAggregate = validateTime($scope.chart.RangeXValue, $scope.chart.Day, $scope.chart.Hours, $scope.chart.Minutes);

        }

        if (value > 23)
            $scope.hoursWarning = true;
        else
            $scope.hoursWarning = false;

        if ($scope.chart.RangeFrom != null && $scope.chart.RangeTo) {
            $scope.showNextSpecificAggregate = true;
        }


    });

    $scope.$watch('chart.Minutes', function (value) {
        if (value == undefined || value > 59) {
            $scope.showNextSpecificAggregate = false;

            //toastr.error("Invalid input for minutes");
        }
        else {


            $scope.showNextSpecificAggregate = validateTime($scope.chart.RangeXValue, $scope.chart.Day, $scope.chart.Hours, $scope.chart.Minutes);

        }

        if (value > 59)
            $scope.minutesWarning = true;
        else
            $scope.minutesWarning = false;

        if ($scope.chart.RangeFrom != null && $scope.chart.RangeTo) {
            $scope.showNextSpecificAggregate = true;
        }

    });

    $scope.$watch('chart.AggregateOptionNormal', function (value) {
        if (value == 6 && $scope.chart.Interval != 1) {
            $scope.showAggregateSpecific = true;
            $scope.showNextSpecificAggregate = false;
        }
        else {
            $scope.showAggregateSpecific = false;
            $scope.showNextSpecificAggregate = true;
        }



    });

    $scope.$watch('chart.RangeBenchMarkOption', function (value) {

        if (value > 5) {
            $scope.showXValueBenchmark = true;
        }
        else {
            $scope.showXValueBenchmark = false;
        }

        if (value == 6) //x hour
        {

            $scope.XVALUE2 = 'Hours';


        }
        else if (value == 7) // x day
        {

            $scope.XVALUE2 = 'Days';


        }
        else if (value == 8) // x week
        {

            $scope.XVALUE2 = 'Weeks';

        }
        else if (value == 9) // x month
        {

            $scope.XVALUE2 = 'Months';


        }
        else if (value == 10) // x year
        {

            $scope.XVALUE2 = 'Years';


        }

    });

    $scope.$watch('chart.RangeBenchmarkXValue', function (value) {
        if (value < 1000 && value != null && value != undefined) {
            $scope.showNextBenchmark = true;
        }
        else {
            $scope.showNextBenchmark = false;
        }

    });
    //end watch

    $scope.toggleDay = function (day) {
        for (i = 0; i < $scope.days.length; i++) {
            if ($scope.days[i].value != day.value) {
                $scope.days[i].Checked = false;
            }
        }
        day.Checked = !day.Checked;

        if (day.Checked)
            $scope.chart.weekDay = day;
        else
            $scope.chart.weekDay = {};

    }


    $scope.generateChart = function(chart)
    {
        $scope.loading = true;
        $scope.message = "Generating Chart";
        $("#chartdiv").html("");
        chart.Datapoints = $scope.selected;
        chart = removeAllBlankOrNull(chart);
        chartFactory.getLogs(chart)
						   .then(function (result) {

						       result = JSON.parse(result);
						       chart.chartData = result;
						       $scope.chartData = result;
						       if (result != "") {
						           chart.chartDataColumn = Object.keys(result[0]);
						           $scope.chartDataColumn = chart.chartDataColumn;
						       }
                              
							   drawChart(chart.ChartType,
								   chart.Interval,
								   chart.chartData,
								   chart.chartDataColumn,
								   chart.Datapoints, "chartdiv");
							    $scope.loading = false;
                                $('.carousel').carousel('next');

						   });
    }


    function validateDate(from, to) {
        if (from == undefined)
            return false;
        if (to == undefined)
            return false;
        if (from > to)
            return false;

        return true;
    }
    function validateChart(chart) {
        if (chart.Name == undefined) {
            toastr.error("Put Chart Name First");
            $scope.loading = false;
            return false;
        }
        if (chart.Interval.value == 0 || chart.Interval == undefined) {
            toastr.error("Select Interval first");
            $scope.loading = false;
            return false;
        }
        if (chart.ChartType.value == 0 || chart.ChartType == undefined) {
            toastr.error("Select ChartType first");
            $scope.loading = false;
            return false;
        }

        if (chart.QueryMode.value == 0 || chart.QueryMode == undefined) {
            toastr.error("Select QueryMode first");
            $scope.loading = false;
            return false;
        }
        if (chart.RangeFrom != null && chart.RangeTo != null) {
            if (!validateDate(chart.RangeFrom, chart.RangeTo)) {
                toastr.error("Time Range To should be greater than From");
                $scope.loading = false;
                return false;
            }
        }
        if (chart.BenchmarkFrom != null && chart.BenchmarkTo != null) {
            if (!validateDate(chart.BenchmarkFrom, chart.BenchmarkTo)) {
                toastr.error("Benchmark To should be greater than From");
                $scope.loading = false;
                return false;
            }
        }

        if (chart.AggregateOptionNormal == null && chart.AggregateOptionFaulty == null) {
            toastr.error("Check Aggregate Options");
            $scope.loading = false;
            return false;
        }


        return true;
    }
    function validateTime(day, hour, minute) {
            
            if (hour != "")
            {
                if (hour != undefined || hour != null) {
                    if (hour > 24)
                        return false;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
            if (day != "")
            {
                if (day != undefined || day != null) {
                    if (day > $scope.dayNumber)
                        return false;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
           

            return true;
    }



});

