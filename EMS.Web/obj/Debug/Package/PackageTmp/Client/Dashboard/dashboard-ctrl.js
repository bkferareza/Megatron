dashboardModule.controller('dashboardController',
	function ($scope, toastr, $location, CurrentUser, 
CurrentRole, Expiration, $timeout, $route,
$modal, miscService, dashboardFactory, GeneralConfiguration, datapointsFactory, chartFactory, discussionsFactory) {
		$scope.hasLogo = false;
		$scope.logoUrl = "/api/misc/getlogo?stamp=" + Date.now().toString();
		miscService.hasLogo().then(function (data) { $scope.hasLogo = data; });
		miscService.loadTheme();

		$scope.currentPage = "Dashboard";
		$scope.showDashboard = true;
		$scope.currentUser = CurrentUser.getUser();
		$scope.loggedUser = CurrentUser.getUserInfo();
		$scope.page.setTitle('EMS Dashboard Page');
		$scope.Expiration = Expiration.getExpiryInMS();
		$scope.hideManage = CurrentRole.IsAdmin();
		$scope.loading = false;
		$scope.$GeneralConfiguration = GeneralConfiguration;

		$scope.togglePage = function () {
		    $scope.showDashboard = !$scope.showDashboard;
		    if ($scope.showDashboard)
		        $scope.currentPage = "Dashboard";
		    else
		        $scope.currentPage = "Discussion Board";

		    toastr.info($scope.currentPage + " is shown");
		}

		$scope.logOut = function () {
			var url = '/';
			$location.path(url);
		}


		$scope.$on('timer-tick', function (event, args) {
			$timeout(function () {
				var dateNow = new Date();
				var expiry = Expiration.getExpiry();
				if (+dateNow >= +expiry) {
					var url = '/';
					$location.path(url);
					toastr.error("Your access is expired");
				}



			});
		});
		
		//DataPoints
		
		$scope.list = [];
		$scope.datapoint = {};
		$scope.variableTree = [];
		$scope.selected = [];
		$scope.dataPointHolder = [];
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
		$scope.showToggle = function (items) {
			var variableTree = items.$modelValue;

			if (variableTree.ChildVariables != null) {
				return variableTree.ChildVariables.length > 0;
			}

			return false;
		}

		function datapointRecursion(datapoint)
		{
			if (datapoint.ChildVariables == null) {
				if (!(isExist(datapoint, $scope.dataPointHolder))) {
					if (datapoint.Type != 1)
						$scope.dataPointHolder.push(datapoint);
				}
				else {
					var index = $scope.dataPointHolder.indexOf(datapoint);
					$scope.dataPointHolder.splice(index, 1);
				}


			}
			else {

				datapoint.ChildVariables.forEach(datapointRecursion);
			}
		}

		$scope.modifyDataPoint = function (datapoint, datapointSet) {
			if ($scope.currentPage == "Dashboard")
			{
				$scope.dataPointHolder = datapointSet;
				datapointRecursion(datapoint);
				datapointSet = $scope.dataPointHolder;
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

		$scope.loggedUser.UserId = $scope.loggedUser.ID;

		datapointsFactory.getVariableTree($scope.loggedUser.UserId)
		.then(function (result) {
			var data = [];
			data.push(result);
			$scope.variableTree = data;
		});
		
		//Chart Definitions
			   $scope.aggregateOptions = [{ "Name": "Average", "value": 1 },
										{ "Name": "Min Select", "value": 2 },
										{ "Name": "Max Select", "value": 3 },
										{ "Name": "Summation", "value": 4 },
										{ "Name": "Last Value", "value": 5 },
										{ "Name": "Specific", "value": 6 }];
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

					$scope.logIntervals = [{ "Name": "Minute", "value": 1 },
											  { "Name": "Hour", "value": 2 },
											  { "Name": "Day", "value": 3 },
											  { "Name": "Week", "value": 4 },
											  { "Name": "Month", "value": 5 },
											  { "Name": "Year", "value": 6 }];

					$scope.rangeType = [{"Name":"Fixed"},{"Name":"Repeated"}];


		//Dashboard
		$scope.activeTemplate = {};
		$scope.Charts = [];
		$scope.loading = true;
		$scope.Message = "Loading Templates";

		dashboardFactory.getActiveTemplate($scope.loggedUser.ID)
		.then(function (result)
		{
			if (result != null && result != undefined && result != "")
			{
				$scope.activeTemplate = result;
				dashboardFactory.getChartsForActiveTemplate($scope.activeTemplate.ID)
				.then(function (result) {
					if (result.length < 50 && result != null)
					{
						
						
						$scope.Charts = result;
						var index = result.length;
						toastr.success(index + " Chart(s) loaded", "Loading Active Template Success");
						
						$scope.Charts.forEach($scope.getDataPoints);
						$scope.Charts.forEach($scope.generateChart);

						
					}
					$scope.loading = false;

				});
			}
			else
				$scope.loading = false;
		});

		$scope.getDataPoints = function(chart)
		{
			$scope.Message = "Loading Datapoints for " + chart.Name;
			$scope.loading = true;
			dashboardFactory.getChartDataPoints(chart.ID)
			.then(function (result) {
				chart.DataPoints = result;
				$scope.loading = false;
			});
		}

		$scope.generateChart = function(chart)
		{
			$scope.Message = "Generating Chart for " + chart.Name;
			$scope.loading = true;
			chart.chartdiv = "chartdiv" + chart.ID;
			chart.ChartModal = "chart" + chart.ID + "modal";
			dashboardFactory.getLogs(chart.ID)
			   .then(function (result) {

				   chart.chartData = result;
				   if (result != "") {
					   chart.chartDataColumn = Object.keys(result[0]);
				   }

				   drawChart(chart.ChartType,
					   chart.Interval,
					   chart.chartData,
					   chart.chartDataColumn,
					   chart.DataPoints, chart.chartdiv);
				   $scope.loading = false;

			   });
		}


		$scope.regenerateChart = function (Chart) {
			var chart = angular.copy(Chart);
			$scope.loading = true;
			$scope.Message = "Generating Chart for " + chart.Name;
			//for (i = 0; i < chart.DataPoints.length; i++)
			//{
			//    chart.DataPoints[i].FriendlyName = null;
			//    chart.DataPoints[i].Icon = null;
			//    chart.DataPoints[i].TagName = null;
			//    chart.DataPoints[i].Color = null;

			//}
			//chart.Template = null;
			//chart.chartData = null;
			//chart.chartDataColumn = null;
			//chart.chartdiv = null;
			chart.UserChart = true;
			chart = removeAllBlankOrNull(chart);
			chartFactory.getLogs(chart)
							   .then(function (result) {
								   chart.chartdiv = "chartdiv" + chart.ID;
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
									   chart.DataPoints, chart.chartdiv);
								   $scope.loading = false;

							   });
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

		//Discussion Board

		$scope.discussionCharts = [];
		
		$scope.showDashboard = true;

		

		discussionsFactory.getChartsForDiscussionBoard($scope.loggedUser.ID)
		.then(function (result) {
		    result = JSON.parse(result);
			if (result.length < 50 && result != null) {

			    if (result != undefined)
			    {
			        $scope.discussionCharts = result;
			        var index = result.length;
			        $scope.discussionCharts.forEach($scope.getDataPoints);
			        $scope.discussionCharts.forEach($scope.generateChartDiscussion);
			        $scope.discussionCharts.forEach($scope.getDiscussion);
			        $scope.discussionCharts.forEach($scope.getChartCreator);
			    }
				


			}
			$scope.loading = false;
		});

		$scope.generateChartDiscussion = function (chart) {
		    $scope.Message = "Generating Chart for " + chart.Name;
		    $scope.loading = true;
		    chart.chartdiv = "chartdiscussiondiv" + chart.ID;
		    chart.ChartModal = "chartdiscussion" + chart.ID + "modal";
		    dashboardFactory.getLogs(chart.ID)
			   .then(function (result) {

			       chart.chartData = result;
			       if (result != "") {
			           chart.chartDataColumn = Object.keys(result[0]);
			       }

			       drawChart(chart.ChartType,
					   chart.Interval,
					   chart.chartData,
					   chart.chartDataColumn,
					   chart.DataPoints, chart.chartdiv);
			       $scope.loading = false;

			   });
		}

		$scope.getDiscussion = function(chart)
		{
		    discussionsFactory.getDiscussionBoard(chart.ID)
                .then(function (result)
			    {
				chart.DiscussionBoard = JSON.parse(result);
				discussionsFactory.getDiscussionMessages(chart.DiscussionBoard.ID)
				.then(function (result) {
				    result = JSON.parse(result);
					chart.DiscussionBoard.DiscussionMessages = result;
					chart.DiscussionBoard.DiscussionMessages.forEach($scope.getAuthor);
					toastr.success("Discussion Board for: " + chart.Name + " successfully retrieved");
				});
			   });
		}

		$scope.getAuthor = function(message)
		{
			discussionsFactory.getMessageAuthor(message.UserID)
			.then(function (result) {
			    result = JSON.parse(result);
				message.Author = result.GivenName + " " + result.Surname;
			});
		}

		$scope.getChartCreator = function (chart) {
		    discussionsFactory.getMessageAuthor(chart.Template.UserID)
			.then(function (result) {
			    result = JSON.parse(result);
			    chart.Author = result.GivenName + " " + result.Surname;
			});
		}

		$scope.createDiscussion = function(discussionMessage,chart)
		{
		    
		    if (isExist(chart, $scope.discussionCharts))
		    {
		        var index = {};
		        for (i = 0; i < $scope.discussionCharts.length; i++)
		        {
		            if (chart.ID == $scope.discussionCharts[i].ID)
		                index = i;
		        }
		        $scope.sendReply($scope.discussionCharts[index].DiscussionBoard.ID, discussionMessage, $scope.discussionCharts[index]);
		        $('#' + chart.ChartModal).modal('hide');
		       
		    }
		    else
		    {
		        var entity = { "Chart": chart, "DiscussionMessage": discussionMessage, "userID": $scope.loggedUser.UserId };
		        discussionsFactory.saveChanges(entity)
               .then(function (result) {
                   if (result)
                       toastr.success("Discussion Message Sent", "Success!");
                   else
                       toastr.error("Fail to send Discussion Message", "Error");

                   $scope.reloadPage();
               });
		    }
		    
		}

		$scope.sendReply = function(discussionId,discussionMessage,chart)
		{
		    var entity = { "DiscussionId": discussionId, "DiscussionMessage": discussionMessage, "userID": $scope.loggedUser.UserId };
			
			discussionsFactory.saveChanges(entity)
			.then(function (result) {
				if (result)
					toastr.success("Discussion Message Sent", "Success!");
				else
					toastr.error("Fail to send Discussion Message", "Error");
				$('#' + chart.ChartModal).modal('hide');
				chart.Message = "";
				$scope.reloadDiscussionBoard(chart);
			});
		}

		$scope.reloadDiscussionBoard = function (chart) {
		   
		    discussionsFactory.getDiscussionMessages(chart.DiscussionBoard.ID)
				.then(function (result) {
				    result = JSON.parse(result);
				    chart.DiscussionBoard.DiscussionMessages = result;
				    chart.DiscussionBoard.DiscussionMessages.forEach($scope.getAuthor);
				    toastr.success("Discussion Board for: " + chart.Name + " successfully retrieved");
				});
		}

		$scope.reloadPage = function()
		{
			var url = '/dashboard';
			$location.path(url);
			$route.reload();
		}


	});