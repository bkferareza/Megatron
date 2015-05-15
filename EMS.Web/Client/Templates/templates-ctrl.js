templateModule.controller('templateController',
    function ($scope, toastr, $location,$route,
        $timeout, CurrentUser, Expiration,
        Logout, miscService, CurrentRole, templatesFactory, chartFactory, datapointsFactory, GeneralConfiguration,
        auditTrailFactory, Permissions)
    {
        //datapoints

        $scope.list = [];
        $scope.datapoint = {};
        $scope.variableTree = []; 
        $scope.selected = [];
        $scope.showChartWindow = false;
        $scope.chartData = [];
        $scope.chartDataColumn = [];
        $scope.$GeneralConfiguration = GeneralConfiguration;
        $scope.$Permissions = Permissions;

        var height = $(window).height() - 110;
        $('#left-panel').height(height);

        //datapointsFactory.getDatapoints()
        //.then(function (result) {
        //    $scope.list = result;
        //}
        //);

        $scope.modifyDataPoint = function (datapoint) {
            if (datapoint.ChildVariables == null)
            {
                if (!(isExist(datapoint, $scope.selected))) {
                    if (datapoint.Type != 1)
                        $scope.selected.push(datapoint);
                }
                else {
                    var index = $scope.selected.indexOf(datapoint);
                    $scope.selected.splice(index, 1);
                }
                
                
            }
            else
            {
                
                   datapoint.ChildVariables.forEach($scope.modifyDataPoint);
            }
            
                
        }



        function isExist(item,array)
        {
            var index = array.length;

            for(i = 0; i < array.length; i++)
            {
                if(item.ID == array[i].ID)
                {
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

        $scope.loggedUser = CurrentUser.getUserInfo();
        $scope.loggedUser.UserId = $scope.loggedUser.ID;

        datapointsFactory.getVariableTree($scope.loggedUser.UserId)
        .then(function (result) {
            var data = [];
            data.push(result);
            $scope.variableTree = data;
        });


        $scope.hasLogo = false;
        $scope.logoUrl = "/api/misc/getlogo?stamp=" + Date.now().toString();
        miscService.hasLogo().then(function (data) { $scope.hasLogo = data; });
        miscService.loadTheme();
        $scope.currentUser = CurrentUser.getUser();
        $scope.Expiration = Expiration.getExpiryInMS();
        $scope.hideManage = CurrentRole.IsAdmin();

        if ($scope.$Permissions.permissions().CanModifyUsers && $scope.$Permissions.permissions().CanModifyTemplates && $scope.$Permissions.permissions().CanCreateFoldersDatapoints) {
            $scope.hideManage = true;
        }
        else {
            $scope.hideManage = false;
        }

        $scope.user = CurrentUser.getUserInfo();
        $scope.page.setTitle('EMS Templates Management Page');
        $scope.loading = false;
        $scope.chartWizard = false;
        $scope.$on('timer-tick', function (event, args) {
            $timeout(function () {
                var dateNow = new Date();
                var expiry = Expiration.getExpiry();
                if (+dateNow >= +expiry) {
                    var url = '/';
                    $location.path(url);
                    $route.reload();
                    toastr.error("Your access is expired");
                }

            });
        });

        $scope.reloadPage = function () {
            var url = '/templates/manage';
            $scope.user = CurrentUser.getUserInfo();
            $location.path(url);
            $route.reload();

        }

        $scope.logOut = function () {
            Logout.logOut();
            var url = '/';
            $location.path(url);
            $route.reload();
        }

        
        //Template Management Functions
        $scope.templates = [];

        $scope.template = {};


        $scope.chart = {};

        $scope.displayChart = {};

        $scope.charts = [];

        $scope.XVALUE = {};

        $scope.XVALUE2 = {};

        $scope.MaxHours = 0;
        $scope.MaxDays = 0;
        $scope.MaxWeeks = 0;
        $scope.MaxMonths = 0;
        $scope.MaxYears = 0;
        $scope.MaxXValue = 0;
        $scope.SelectedWeekday = null;

        function getCurrentDate()
        {
            var currentDate = new Date();
            return currentDate;
        }
        $scope.year = getCurrentDate().getFullYear();
        $scope.currentMonth = getCurrentDate().getMonth();
        $scope.dayNumber = Date.getDaysInMonth($scope.year, $scope.currentMonth);

        $scope.pattern = "/^[1-9]$|^[1-2]\d$|^3[0-1]$/";

        //initialize
        templatesFactory.getTemplates()
            .then(function (result) {
                $scope.templates = result;

                var height = $(window).height() - 110;
                $('#left-panel').height(height);
            });

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

        $scope.days = [ { "Name": "Sunday", "Tag": "S", "Checked": false,"value":1 },
                        { "Name": "Monday", "Tag": "M", "Checked": false, "value": 2 },
                        { "Name": "Tuesday", "Tag": "T", "Checked": false, "value": 3 },
                        { "Name": "Wednesday", "Tag": "W", "Checked": false, "value": 4 },
                        { "Name": "Thursday", "Tag": "TH", "Checked": false, "value": 5 },
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

        $scope.weeks = [{ "Name": "Monday", "value": 1 },
                        { "Name": "Tuesday", "value": 2 },
                        { "Name": "Wednesday", "value": 3 },
                        { "Name": "Thursday", "value": 4 },
                        { "Name": "Friday", "value": 5 },
                        { "Name": "Saturday", "value": 6 },
                        { "Name": "Sunday", "value": 7 }];

        //Switches
        $scope.specialTemplate = true;
        $scope.create = true;
        $scope.panel = true;
        $scope.useTemplate = true;
        $scope.deleteTemplate = true;
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
        $scope.showNextDataPoints = true;
        $scope.savebutton = false;
        $scope.showNextTimeRange = true;
        $scope.showNextBenchmark = true;
        $scope.enableNumericFunctions = true;
        $scope.xvalueWarning = false;
        $scope.xvalueBenchmarkWarning = false;
        $scope.daysWarning = false;
        $scope.hoursWarning = false;
        $scope.minutesWarning = false;
        $scope.showAggregateSpecific = false;
        $scope.showNextSpecificAggregate = false;
        $scope.showXValueTimeRange = false;
        $scope.showXValueBenchmark = false;
        //InitializeLowerAndUpperValue
        $scope.MonthLow = 1;
        $scope.MonthHigh = 12;
        $scope.WeekLow = 1;
        $scope.WeekHigh = 5
        $scope.DayLow = 1;
        $scope.DayHigh = 31;
        $scope.HourLow = 1;
        $scope.HourHigh = 23;
        

        $scope.modify = function(template)
        {
            $scope.template = angular.copy(template);
            $scope.create = false;
            $scope.panel = false;
            $scope.useTemplate = false;
            $scope.deleteTemplate = false;
            $scope.viewChart = false;
            //$scope.chart.Interval = $scope.logIntervals[findValue($scope.template.Interval, $scope.logIntervals)];
            //$scope.chart.ChartType = $scope.chartTypes[findValue($scope.template.ChartType, $scope.chartTypes)];
            //$scope.chart.ViewType = $scope.viewTypes[findValue($scope.template.ViewType, $scope.viewTypes)];
            //$scope.chart.QueryMode = $scope.queryModes[findValue($scope.template.QueryMode, $scope.queryModes)];
            $scope.specialTemplate = template.SpecialTemplate;

            $scope.loading = true;
            $scope.charts = [];
            $scope.Message = "Loading Charts";
            chartFactory.getCharts(template.ID)
            .then(function (result) {
                if (result != null)
                {
                    $scope.charts = JSON.parse(result);
                    $scope.deleteTemplate = true;

                    if ($scope.specialTemplate)
                    {
                        if ($scope.charts.length < 1) {
                            $scope.specialTemplate = false;
                            $scope.createChart = false;
                        }
                        else {
                            $scope.specialTemplate = true;
                            $scope.createChart = true;
                        }
                    }
                    else
                    {
                        $scope.createChart = false;
                        $scope.specialTemplate = true;
                    }
                    
                }      
                else
                {
                    $scope.createChart = false;
                    $scope.specialTemplate = false;
                    $scope.deleteTemplate = false;
                }
                    

                
                    

                $scope.loading = false;
                console.log(result);
            });
            
       
        }

        //List finder
        function findValue(value,object)
        {
            var id = angular.copy(value);
            var array = angular.copy(object);
            for(i = 0; i< array.length; i++)
            {
                if (array[i].value == id)
                    return i;
            }
        }

        $scope.newTemplate = function () {
            templatesFactory.newTemplate()
            .then(function (result) {
                $scope.template = result;
                $scope.template.User = $scope.user;
                $scope.create = false;
                $scope.panel = false;
                $scope.useTemplate = true;
                $scope.deleteTemplate = true;
                $scope.specialTemplate = false;
                toastr.info("Panel Info Opened");
            });
        };

        $scope.delete = function (template) {
           
            $scope.loading = true;
            $scope.Message = "Deleting Template";
            templatesFactory.deleteTemplate(template)
           .then(function (result) {
               if(result.Successful)
               {
                   $scope.loading = false;
                   toastr.success("Delete Success!");
                   $scope.reloadPage();
               }
           });
        };
        function validateTemplate(template)
        {
            if (!validateDate(template.MonthFromWindow, template.MonthToWindow))
            {
                toastr.error("Check Month From and Month To","Saving Failed");
                return false;
            }
                
            if (!validateDate(template.WeekFromWindow, template.WeekToWindow))
            {
                toastr.error("Check Week From and Week To", "Saving Failed");
                return false;
            }
                
            if (!validateDate(template.DayFromWindow, template.DayToWindow))
            {
                toastr.error("Check Day From and Day To", "Saving Failed");
                return false;
            }
                
            if (!validateDate(template.HourFromWindow, template.HourToWindow))
            {
                toastr.error("Check Hour From and Hour To", "Saving Failed");
                return false;
            }
                

            return true;
        }

        $scope.saveChanges = function (template) {
 
            if (validateTemplate(template))
            {
                $scope.loading = true;
                $scope.Message = "Saving Template";
                templatesFactory.saveChanges(template)
              .then(function (result) {
                  if (result.Successful) {

                      $scope.loading = false;
                      toastr.success("Saving Success");
                      $scope.reloadPage();
                  }
              });
            }
        };

        $scope.activateTemplate = function(template)
        {
            var temp = angular.copy(template);
            $scope.loading = true;
            temp.UserId = $scope.loggedUser.UserId;
            $scope.Message = "Activating Template..";
            templatesFactory.activateTemplate(temp)
            .then(function (result) {
                $scope.loading = false;
                if(result)
                {
                    toastr.success("Activating Success");
                    $scope.reloadPage();
                }
            });
        }
        //watches
        $scope.$watch('chart.Interval', function (value) {
            if(value == 4)
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

            }
            else if (value == 2) //day
            {
                $scope.showWeeks = false;
                $scope.showHours = true;
                $scope.showDays = false;
                $scope.showMinutes = true;
                $scope.enableNumericFunctions = true;
                $scope.showMonths = false;


            }
            else if (value == 3) // week
            {

                $scope.showWeeks = true;
                $scope.showHours = true;
                $scope.showDays = false;
                $scope.showMinutes = true;
                $scope.showMonths = false;
                $scope.enableNumericFunctions = true;




            }
            else if (value == 4) // month
            {

                $scope.showHours = true;
                $scope.showMinutes = true;
                $scope.showWeeks = false;
                $scope.showDays = true;
                $scope.showMonths = false;
                $scope.enableNumericFunctions = true;



            }

            else if (value == 5)//year
            {

                $scope.showHours = true;
                $scope.showMinutes = true;
                $scope.showWeeks = false;
                $scope.showDays = true;
                $scope.showMonths = true;
                $scope.enableNumericFunctions = false;



            }
            if (value == 6) //x hour
            {
                $scope.showWeeks = false;
                $scope.showHours = false;
                $scope.showDays = false;
                $scope.showMinutes = true;
                $scope.showMonths = false;



            }
            else if (value == 7) // x day
            {
                $scope.showWeeks = false;
                $scope.showHours = true;
                $scope.showDays = false;
                $scope.showMinutes = true;
                $scope.showMonths = false;



            }
            else if (value == 8) // x week
            {
                $scope.showWeeks = true;
                $scope.showHours = true;
                $scope.showDays = false;
                $scope.showMinutes = true;
                $scope.showMonths = false;


            }
            else if (value == 9) // x month
            {
                $scope.showWeeks = false;
                $scope.showHours = true;
                $scope.showDays = true;
                $scope.showMinutes = true;
                $scope.showMonths = false;
                $scope.enableNumericFunctions = true;



            }
            else if (value == 10) // x year
            {
                $scope.showWeeks = false;
                $scope.showHours = true;
                $scope.showDays = true;
                $scope.showMinutes = true;
                $scope.showMonths = true;
                $scope.enableNumericFunctions = false;

  

            }

            if ($scope.chart.AggregateOptionNormal == 6 && $scope.chart.Interval != 1) {
                $scope.showAggregateSpecific = true;
                $scope.showNextSpecificAggregate = true;
            }
            else
            {
                $scope.showAggregateSpecific = false;
                $scope.showNextSpecificAggregate = true;
            }

        });

        $scope.$watch('chart.RangeType', function (value) {
            if(value == 'Fixed')
            {
                $scope.showNext = true;
                $scope.showRangeOption = false;
                $scope.logIntervals = [{ "Name": "Minute", "value": 1 },
                                      { "Name": "Hour", "value": 2 },
                                      { "Name": "Day", "value": 3 },
                                      { "Name": "Week", "value": 4 },
                                      { "Name": "Month", "value": 5 },
                                        { "Name": "Year", "value": 6 }];
           

            }
            else if(value == 'Repeated')
            {
                $scope.showRangeOption = true;
                $scope.showNext = true;
                $scope.chart.RangeFrom = null;
                $scope.chart.RangeTo = null;
               
            }
            

        });

        $scope.$watch('chart.RangeOption', function (value) {

            $scope.showNextTimeRange = false;

            if (value == 1) // hour
            {
                $scope.enableNumericFunctions = true;
                $scope.showNextTimeRange = true;
                $scope.logIntervals = [{ "Name": "Minute", "value": 1 },
                          { "Name": "Hour", "value": 2 }];
            }
            else if (value == 2) //day
            {
                $scope.enableNumericFunctions = true;
                $scope.showNextTimeRange = true;
                $scope.logIntervals = [{ "Name": "Minute", "value": 1 },
                          { "Name": "Hour", "value": 2 },
                          { "Name": "Day", "value": 3 }];
            }
            else if (value == 3) // week
            {
                $scope.enableNumericFunctions = true;
                $scope.showNextTimeRange = true;
                $scope.logIntervals = [{ "Name": "Minute", "value": 1 },
                      { "Name": "Hour", "value": 2 },
                      { "Name": "Day", "value": 3 },
                      { "Name": "Week", "value": 4 }];
            }
            else if (value == 4) // month
            {
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
                $scope.showXValueTimeRange = true;
                $scope.XVALUE = 'Hours';
                $scope.MaxXValue = $scope.MaxHours;
                $scope.logIntervals = [{ "Name": "Minute", "value": 1 },
                          { "Name": "Hour", "value": 2 }];
            }
            else if (value == 7) // x day
            {
                $scope.showXValueTimeRange = true;
                $scope.XVALUE = 'Days';
                $scope.MaxXValue = $scope.MaxDays;
                $scope.logIntervals = [{ "Name": "Minute", "value": 1 },
                          { "Name": "Hour", "value": 2 },
                          { "Name": "Day", "value": 3 }];
            }
            else if (value == 8) // x week
            {
                $scope.showXValueTimeRange = true;
                $scope.XVALUE = 'Weeks';
                $scope.MaxXValue = $scope.MaxWeeks;
                $scope.logIntervals = [{ "Name": "Minute", "value": 1 },
                          { "Name": "Hour", "value": 2 },
                          { "Name": "Day", "value": 3 },
                          { "Name": "Week", "value": 4 }];
            }
            else if (value == 9) // x month
            {
                $scope.enableNumericFunctions = true;
                $scope.showXValueTimeRange = true;
                $scope.XVALUE = 'Months';
                $scope.MaxXValue = $scope.MaxMonths;
                $scope.logIntervals = [{ "Name": "Minute", "value": 1 },
                      { "Name": "Hour", "value": 2 },
                      { "Name": "Day", "value": 3 },
                      { "Name": "Week", "value": 4 },
                      { "Name": "Month", "value": 5 }];
            }
            else if (value == 10) // x year
            {
                $scope.enableNumericFunctions = false;
                $scope.showXValueTimeRange = true;
                $scope.XVALUE = 'Years';
                $scope.MaxXValue = $scope.MaxYears;
                $scope.logIntervals = [{ "Name": "Minute", "value": 1 },
                     { "Name": "Hour", "value": 2 },
                     { "Name": "Day", "value": 3 },
                     { "Name": "Week", "value": 4 },
                     { "Name": "Month", "value": 5 },
                       { "Name": "Year", "value": 6 }];
            }

            if (value == undefined)
            {
                $scope.showNextTimeRange  = false;
                $scope.showRangeOptionValue = false;
            }          
            else if (value < 6)
            {
                $scope.showNextTimeRange = true;
                $scope.showRangeOptionValue = false;
                $scope.enableNumericFunctions = true;
            }
            else
            {
                $scope.showRangeOptionValue = true;
                $scope.enableNumericFunctions = true;
                $scope.showNextTimeRange = true;

                if ($scope.chart.RangeXValue != undefined) {
                    if ($scope.chart.RangeXValue != null) {
                        if ($scope.chart.RangeXValue != 0) {
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

                if ($scope.chart.RangeXValue > $scope.MaxXValue) {
                    $scope.xvalueWarning = true;
                    $scope.showNextTimeRange = false;
                }
            }
          
        });

        $scope.$watch('chart.RangeXValue', function (value) {
            if (value != undefined) {
                if (value != null)
                {
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
            else
            {
                if ($scope.chart.RangeOption >= 6) {
                    $scope.showNextTimeRange = false;
                }
               
            }
               

            if ($scope.XVALUE == 'Years')
            {
                $scope.year = getCurrentDate().getFullYear();
                $scope.year = $scope.year - value;
                $scope.dayNumber = Date.getDaysInMonth($scope.year, $scope.currentMonth);

                if ($scope.chart.Day > $scope.dayNumber)
                    $scope.daysWarning = true;
                else
                    $scope.daysWarning = false;
            }

            if (value > $scope.MaxXValue)
            {
                $scope.xvalueWarning = true;
                $scope.showNextTimeRange = false;
            }
                
            
        });

        $scope.$watch('chart.Month', function (value) {
            
            $scope.MonthLow = $scope.MonthLow - 1;

            if (value != undefined) {
                $scope.currentMonth = value.value - 1;
                $scope.enableNumericFunctions = true;
                $scope.dayNumber = Date.getDaysInMonth($scope.year, $scope.currentMonth);

                if ($scope.dayNumber > $scope.DayHigh) {
                    $scope.dayNumber = $scope.DayHigh;
                }
            }

            else {

                if ($scope.chart != undefined) {

                    var date = new Date($scope.chart.RangeValue);

                    var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

                    $scope.chart.Month = findMonth(newDate.getMonth() + 1);
                    $scope.chart.Day = newDate.getDate();
                    $scope.chart.Hours = newDate.getHours();
                    $scope.chart.Minutes = newDate.getMinutes();
                }
                $scope.enableNumericFunctions = true;
            }

            if ($scope.XVALUE == 'Years') {
                $scope.dayNumber = Date.getDaysInMonth($scope.year, $scope.currentMonth);
                if ($scope.dayNumber > $scope.DayHigh) {
                    $scope.dayNumber = $scope.DayHigh;
                }
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
            if(value != undefined && value != null && value != "" )
            {
                $scope.showNextChartName = true;
            }
            else
                $scope.showNextChartName = false;
            if ($scope.chart.RangeFrom != null && $scope.chart.RangeTo) {
                $scope.showNextTimeRange = true;
            }

        });

        $scope.$watch('chart.RangeFrom', function (value) {
            if ($scope.chart.RangeType == "Fixed") {
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
            }
        });

        $scope.$watch('chart.RangeTo', function (value) {
            if ($scope.chart.RangeType == "Fixed") {
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
            }
               
        });

        $scope.$watch('chart.BenchmarkFrom', function (value) {
            if ($scope.chart.RangeType == "Fixed") {
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
            }
        });

        $scope.$watch('chart.BenchmarkTo', function (value) {
            if ($scope.chart.RangeType == "Fixed") {
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
            }
        });

        $scope.$watch('chart.Day', function (value) {
            if (value == undefined || value > $scope.dayNumber) {
                $scope.showNextSpecificAggregate = false;
                //toastr.error("Invalid input for hours");
               
            }
            else
            {
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
            else
            {
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
            else
            {
               
                $scope.showNextSpecificAggregate = validateTime($scope.chart.RangeXValue, $scope.chart.Day, $scope.chart.Hours, value);

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
            if (value == 6 && $scope.chart.Interval != 1)
            {
                $scope.showAggregateSpecific = true;
                $scope.showNextSpecificAggregate = true;
            }
            else
            {
                $scope.showAggregateSpecific = false;
                $scope.showNextSpecificAggregate = true;
            }
                


        });

        $scope.$watch('chart.RangeOptionBenchmark', function (value) {
            if (value > 5)
            {
                if (value == 6) //x hour
                {
                    $scope.XVALUE2 = 'Hours';
                    $scope.MaxXValue = $scope.MaxHours;
                }
                else if (value == 7) // x day
                {
                    $scope.XVALUE2 = 'Days';
                    $scope.MaxXValue = $scope.MaxDays;
                }
                else if (value == 8) // x week
                {
                    $scope.XVALUE2 = 'Weeks';
                    $scope.MaxXValue = $scope.MaxWeeks;
                }
                else if (value == 9) // x month
                {
                    $scope.XVALUE2 = 'Months';
                    $scope.MaxXValue = $scope.MaxMonths;
                }
                else if (value == 10) // x year
                {
                    $scope.XVALUE2 = 'Years';
                    $scope.MaxXValue = $scope.MaxYears;
                }

                $scope.showXValueBenchmark = true;
                $scope.showNextBenchmark = false;

                if ($scope.chart.RangeBenchmarkXValue != null && $scope.chart.RangeBenchmarkXValue != undefined && $scope.chart.RangeBenchmarkXValue != "" && $scope.chart.RangeBenchmarkXValue <= $scope.MaxXValue) {
                    $scope.showNextBenchmark = true;
                }
                else {
                    $scope.showNextBenchmark = false;
                }

                if ($scope.chart.RangeBenchmarkXValue != null && $scope.chart.RangeBenchmarkXValue > $scope.MaxXValue) {
                    $scope.xvalueBenchmarkWarning = true;
                    $scope.showNextBenchmark = false;
                }
                else {
                    $scope.xvalueBenchmarkWarning = false;
                }
            }
            else
            {
                $scope.showXValueBenchmark = false;
                $scope.showNextBenchmark = true;
            }

        });

        $scope.$watch('chart.RangeBenchmarkXValue', function (value) {


            if ($scope.chart.RangeOptionBenchmark == undefined || $scope.chart.RangeOptionBenchmark <= 5) {
                $scope.showNextBenchmark = true;
            }
            else {
                if (value != null && value != undefined && value != "" && value <= $scope.MaxXValue) {
                    $scope.showNextBenchmark = true;
                }
                else {
                    $scope.showNextBenchmark = false;
                }

                if (value != null && value > $scope.MaxXValue) {
                    $scope.xvalueBenchmarkWarning = true;
                    $scope.showNextBenchmark = false;
                }
                else {
                    $scope.xvalueBenchmarkWarning = false;
                }
            }

        });
        //end watch

        function validateTime(rangeXValue, day, hour, minute)
        {
            
            if (hour != "")
            {
                if (hour != undefined || hour != null) {
                    if (hour > 24)
                        return false;
                }

            }
            if (day != "")
            {
                if (day != undefined || day != null) {
                    if (day > $scope.dayNumber)
                        return false;
                }

            }
           
            if (minute != "") {
                if (minute != undefined || minute != null) {
                    if (minute > 60)
                        return false;
                }
            }


            return true;
        }
        
        $scope.openChartWizard = function (template) {

            $scope.chart = {};
            $scope.selected = [];
            $scope.createChart = false;
            $scope.chartWizard = true;
            $scope.chart.templateID = template.ID;
            $scope.MonthLow = template.MonthFromWindow;
            $scope.MonthHigh = template.MonthToWindow;
            $scope.WeekLow = template.WeekFromWindow;
            $scope.WeekHigh = template.WeekToWindow;
            $scope.DayLow = template.DayFromWindow;
            $scope.DayHigh = template.DayToWindow;
            $scope.HourLow = template.HourFromWindow;
            $scope.HourHigh = template.HourToWindow;

            $scope.MaxHours = $scope.$GeneralConfiguration.generalConfiguration().MaxHours;
            $scope.MaxDays = $scope.$GeneralConfiguration.generalConfiguration().MaxDays;
            $scope.MaxWeeks = $scope.$GeneralConfiguration.generalConfiguration().MaxWeeks;
            $scope.MaxMonths = $scope.$GeneralConfiguration.generalConfiguration().MaxMonths;
            $scope.MaxYears = $scope.$GeneralConfiguration.generalConfiguration().MaxYears;

        }

        $scope.toggleDay = function (day)
        {
            for(i = 0; i< $scope.days.length; i++)
            {
                if($scope.days[i].value != day.value)
                {
                    $scope.days[i].Checked = false;
                }
            }
            day.Checked = !day.Checked;

            if(day.Checked)
                $scope.chart.weekDay = day;
            else
                $scope.chart.weekDay = {};
            
        }

        //Chart Methods
        function validateDate(from,to)
        {
            if (from == undefined)
                return false;
            if (to == undefined)
                return false;
            if (from > to)
                return false;
            if (from == to)
                return false;
            return true;
        }

        function validateChart(chart) {
            if (chart.Name == undefined)
            {
                toastr.error("Put Chart Name First");
                $scope.loading = false;
                return false;
            }
            if (chart.Interval == undefined || chart.Interval.value == 0) {
                toastr.error("Select Interval first");
                $scope.loading = false;
                return false;
            }
            if (chart.ChartType == undefined || chart.ChartType.value == 0) {
                toastr.error("Select ChartType first");
                $scope.loading = false;
                return false;
            }

            if (chart.QueryMode == undefined || chart.QueryMode.value == 0) {
                toastr.error("Select QueryMode first");
                $scope.loading = false;
                return false;
            }
            if (chart.RangeFrom != null && chart.RangeTo != null)
            {
                if(!validateDate(chart.RangeFrom, chart.RangeTo)) {
                toastr.error("Time Range To should be greater than From");
                $scope.loading = false;
                return false;
                }
            }
            if (chart.BenchmarkFrom != null && chart.BenchmarkTo != null)
            {
                if (!validateDate(chart.BenchmarkFrom, chart.BenchmarkTo)) {
                    toastr.error("Benchmark To should be greater than From");
                    $scope.loading = false;
                    return false;
                }
            }
            
            if (chart.AggregateOptionNormal == null && chart.AggregateOptionFaulty == null)
            {
                toastr.error("Check Aggregate Options");
                $scope.loading = false;
                return false;
            }

            if (chart.Month != null)
            {
                if(chart.Day == null)
                {
                    toastr.error("Day field in Specific Aggregate should have a value");
                    $scope.loading = false;
                    return false;
                }
                if(chart.Hours == null)
                {
                    toastr.error("Hour field in Specific Aggregate should have a value");
                    $scope.loading = false;
                    return false;
                }
            }
            

            return true;
        }

        $scope.saveChart = function (chart)
        {
            $scope.logging = false;
            if (validateChart(chart))
            {
                chart.Template = null;
                chart = removeAllBlankOrNull(chart);
                $scope.logging = true;
                $scope.Message = "Saving Chart...";
                chart.DataPoints = [];
                for (i = 0; i < $scope.selected.length; i++)
                    chart.DataPoints.push($scope.selected[i].ID);

                if (chart.weekDay == undefined)
                {
                    chart.weekDay = $scope.SelectedWeekday;
                }

                $scope.savebutton = true;
                chartFactory.saveChartChanges(chart)
                .then(function (result) {
                    if (result) {
                        $scope.logging = false;
                        toastr.success("Saving Success");
                        $scope.reloadPage();
                    }
                    else
                    {
                        $scope.logging = false;
                        toastr.error("Chart not saved","Error Saving");
                        $scope.reloadPage();
                    }
                });
            }
            
        }

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
        
        $scope.modifyChart = function(chart)
        {
            $scope.displayChart = angular.copy(chart);
            $scope.viewChart = true;

            $scope.MaxHours = $scope.$GeneralConfiguration.generalConfiguration().MaxHours;
            $scope.MaxDays = $scope.$GeneralConfiguration.generalConfiguration().MaxDays;
            $scope.MaxWeeks = $scope.$GeneralConfiguration.generalConfiguration().MaxWeeks;
            $scope.MaxMonths = $scope.$GeneralConfiguration.generalConfiguration().MaxMonths;
            $scope.MaxYears = $scope.$GeneralConfiguration.generalConfiguration().MaxYears;

            $scope.chart.RangeBenchMarkOption = chart.RangeOptionBenchmark;
            $scope.chart.RangeOption = chart.RangeOption;

            if (chart.RangeValue != undefined) {

                var date = new Date(chart.RangeValue);

                var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

                $scope.chart.Month = findMonth(newDate.getMonth() + 1);
                $scope.chart.Day = newDate.getDate();
                $scope.chart.Hours = newDate.getHours();
                $scope.chart.Minutes = newDate.getMinutes();
                $scope.chart.weekDay = findDayOfWeek(newDate.getDay() + 1);

                $scope.toggleDay($scope.chart.weekDay);
                $scope.SelectedWeekday = $scope.chart.weekDay;
            }
            //$scope.displayChart.QueryMode = $scope.queryModes[findValue($scope.displayChart.QueryMode, $scope.queryModes)];
            //$scope.displayChart.Interval = $scope.logIntervals[findValue($scope.displayChart.Interval, $scope.logIntervals)];
            //$scope.displayChart.ChartType = $scope.chartTypes[findValue($scope.displayChart.ChartType, $scope.chartTypes)];
            //if ($scope.displayChart.RangeOption != null)
            //{
            //    $scope.displayChart.RangeOption = $scope.rangeOptions[findValue($scope.displayChart.RangeOption, $scope.rangeOptions)];
            //}
            if ($scope.displayChart.RangeFrom != null && $scope.displayChart.RangeTo)
            {
                $scope.displayChart.RangeFrom = Date.parse($scope.displayChart.RangeFrom);
                $scope.displayChart.RangeTo = Date.parse($scope.displayChart.RangeTo);
                $scope.showNextTimeRange = true;
            }
            if ($scope.displayChart.BenchmarkFrom != null && $scope.displayChart.BenchmarkTo)
            {
                $scope.displayChart.BenchmarkFrom = Date.parse($scope.displayChart.BenchmarkFrom);
                $scope.displayChart.BenchmarkTo = Date.parse($scope.displayChart.BenchmarkTo);
            }
            if ($scope.displayChart.RangeType == 1)
                $scope.displayChart.RangeType = 'Fixed';
            else {
                $scope.displayChart.RangeType = 'Repeated';
                $scope.chart.RangeXValue = chart.RangeOptionXValue;
                $scope.displayChart.RangeXValue = chart.RangeOptionXValue;

                $scope.chart.RangeBenchmarkXValue = chart.RangeOptionXValueBenchmark;
                $scope.displayChart.RangeBenchmarkXValue = chart.RangeOptionXValueBenchmark;
            }
            //$scope.logging = true;
            //$scope.Message = "Loading DataPoints...";
            $scope.selected = [];
            chartFactory.getDataPoints(chart.ID)
            .then(function (result){ 
                result = JSON.parse(result);
                for (i = 0; i < result.length; i++)
                    $scope.selected.push(result[i]);
                $scope.logging = false;
            });

        }

        $scope.editChart = function (chart)
        {
            $scope.chart = {};
            $scope.chart = angular.copy(chart);
            //$scope.selected = $scope.chart.Datapoints;
            if ($scope.chart.RangeFrom != null && $scope.chart.RangeTo) {
                $scope.showNextTimeRange = true;
            }
            $scope.createChart = false;
            $scope.chartWizard = true;

        }

        $scope.deleteChart = function(chart)
        {
            $scope.logging = true;
            $scope.Message = "Deleting Chart...";
            chartFactory.deleteChart(chart.ID)
            .then(function (result) {
                $scope.logging = false;
                $scope.reloadPage();
            });
        }
        
        $scope.closeWizard = function()
        {
            $scope.chartWizard = !$scope.chartWizard;
            $scope.reloadPage();
        }

        $scope.viewChartWindow = function (displayChart) {
            $("#chartdiv").html("");
            $scope.showChartWindow = !$scope.showChartWindow;

            templatesFactory.getLogs(displayChart.ID)
                .then(function (result) {

                    $scope.chartData = result;
                    $scope.chartDataColumn = Object.keys(result[0]);

                    if (displayChart.QueryMode == 2) {
                        chartFactory.getGroupDatapoints(displayChart.ID)
                            .then(function (result) {

                                drawChart(displayChart.ChartType, displayChart.Interval, $scope.chartData, $scope.chartDataColumn, JSON.parse(result), "chartdiv", true, $scope.$GeneralConfiguration.generalConfiguration().StartOfWeek)

                            });
                    }
                    else {
                        drawChart(displayChart.ChartType, displayChart.Interval, $scope.chartData, $scope.chartDataColumn, $scope.selected, "chartdiv", true, $scope.$GeneralConfiguration.generalConfiguration().StartOfWeek)
                    }

                });
        }

        $scope.closeChartWindow = function (chart) {
            $scope.showChartWindow = !$scope.showChartWindow;
        }

        function findMonth(month) {
            for (ctr = 0; ctr < $scope.months.length; ctr++) {
                if ($scope.months[ctr].value == month)
                    return $scope.months[ctr];
            }
        }

        function findRangeOptions(rangeOption) {
            for (ctr = 0; ctr < $scope.rangeOptions.length; ctr++) {
                if ($scope.rangeOptions[ctr].value == rangeOption)
                    return $scope.rangeOptions[ctr];
            }
        }

        function findDayOfWeek(dayOfWeek) {
            for (ctr = 0; ctr < $scope.days.length; ctr++) {
                if ($scope.days[ctr].value == dayOfWeek)
                    return $scope.days[ctr];
            }
        }

        //AuditTrail


        $scope.AuditColumns = ["Log", "DatetimeStamp"];
        $scope.AuditTrailLogs = [];

        auditTrailFactory.getAuditTrail()
            .then(function (result) {
                if (typeof result == "string")
                    result = JSON.parse(result);

                $scope.AuditTrailLogs = result;
            });

    });
