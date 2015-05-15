dashboardModule.controller('dashboardController',
	function ($scope, toastr, $location, CurrentUser, 
CurrentRole, Expiration, $timeout, $route,
$modal, miscService, dashboardFactory, GeneralConfiguration, datapointsFactory, chartFactory, discussionsFactory, auditTrailFactory, Permissions) {
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
		$scope.SpecialTemplate = false;
		$scope.$GeneralConfiguration = GeneralConfiguration;
		$scope.$GeneralConfiguration.getGeneralConfig();
		$scope.$Permissions = Permissions;

		if ($scope.$Permissions.permissions().CanModifyUsers && $scope.$Permissions.permissions().CanModifyTemplates && $scope.$Permissions.permissions().CanCreateFoldersDatapoints)
		{
		    $scope.hideManage = true;
		}
		else
		{
		    $scope.hideManage = false;
		}


		var vm = this;

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
						{ "Name": "December", "value": 12 } ];
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

					$scope.weeks = [{ "Name": "Monday", "value": 1 },
									{ "Name": "Tuesday", "value": 2 },
									{ "Name": "Wednesday", "value": 3 },
									{ "Name": "Thursday", "value": 4 },
									{ "Name": "Friday", "value": 5 },
									{ "Name": "Saturday", "value": 6 },
									{ "Name": "Sunday", "value": 7 }];

					$scope.rangeType = [{"Name":"Fixed"},{"Name":"Repeated"}];


		//Dashboard
		$scope.activeTemplate = {};
		$scope.Charts = [];
		$scope.loading = true;
		$scope.Message = "Loading Templates";
		
		
		//for special template
		$scope.MaxYear = $scope.$GeneralConfiguration.MaxYears;
		$scope.MaxDay = maxDay();
		$scope.window = {};

		function maxDay()
		{
			var today = new Date();
			var dateNumber = Date.getDaysInMonth(today.getYear(), today.getMonth());
			return dateNumber;
		}

		dashboardFactory.getActiveTemplate($scope.loggedUser.ID)
		.then(function (result)
		{
			if (result != null && result != undefined && result != "")
			{
				$scope.activeTemplate = result;
				if (result.SpecialTemplate)
					$scope.SpecialTemplate = true;
				else
					$scope.SpecialTemplate = false;
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
			chart.chartminidiv = "chartdiv" + chart.ID + "mini";
			chart.ChartModal = "chart" + chart.ID + "modal";
			chart.uploadButton = "chart" + chart.ID + "upload";
			chart.InterfaceModal = "chart" + chart.ID + "interface";
			dashboardFactory.getLogs(chart.ID)
			   .then(function (result) {

				   chart.chartData = result;
				   if (result != "") {
					   chart.chartDataColumn = Object.keys(result[0]);
				   }

				   if (chart.QueryMode == 2) {
					   dashboardFactory.getGroupChartDataPoints(chart.ID)
						   .then(function (result) {

						       chart.Datapoints = JSON.parse(result);

							   if ($scope.SpecialTemplate) {
								   var divpie = chart.chartdiv + "pie";
								   //pie
								   drawChart(4,
								   chart.Interval,
								   chart.chartData,
								   chart.chartDataColumn,
								   chart.DataPoints, divpie, true, $scope.$GeneralConfiguration.generalConfiguration().StartOfWeek);
								   var divline = chart.chartdiv + "line";
								   //line
								   drawChart(3,
								  chart.Interval,
								  chart.chartData,
								  chart.chartDataColumn,
								  chart.DataPoints, divline, true, $scope.$GeneralConfiguration.generalConfiguration().StartOfWeek);

							   }
							   else {
								   drawChart(chart.ChartType,
								   chart.Interval,
								   chart.chartData,
								   chart.chartDataColumn,
								   chart.DataPoints, chart.chartdiv, true, $scope.$GeneralConfiguration.generalConfiguration().StartOfWeek);

								   drawChart(chart.ChartType,
								   chart.Interval,
								   chart.chartData,
								   chart.chartDataColumn,
								   chart.DataPoints, chart.chartminidiv, false, $scope.$GeneralConfiguration.generalConfiguration().StartOfWeek);
								   
							   }

							   $scope.loading = false;

						   });
				   }
				   else {
					   if ($scope.SpecialTemplate) {
						   var divpie = chart.chartdiv + "pie";
						   //pie
						   drawChart(4,
						   chart.Interval,
						   chart.chartData,
						   chart.chartDataColumn,
						   chart.DataPoints, divpie, true, $scope.$GeneralConfiguration.generalConfiguration().StartOfWeek);
						   var divline = chart.chartdiv + "line";
						   //line
						   drawChart(3,
						  chart.Interval,
						  chart.chartData,
						  chart.chartDataColumn,
						  chart.DataPoints, divline, true, $scope.$GeneralConfiguration.generalConfiguration().StartOfWeek);

					   }
					   else {
						   drawChart(chart.ChartType,
						   chart.Interval,
						   chart.chartData,
						   chart.chartDataColumn,
						   chart.DataPoints, chart.chartdiv, true, $scope.$GeneralConfiguration.generalConfiguration().StartOfWeek);

						   drawChart(chart.ChartType,
								   chart.Interval,
								   chart.chartData,
								   chart.chartDataColumn,
								   chart.DataPoints, chart.chartminidiv, false, $scope.$GeneralConfiguration.generalConfiguration().StartOfWeek);
					   }

					   $scope.loading = false;
				   }

			   });
		}


		$scope.regenerateChart = function (Chart) {
			var chart = angular.copy(Chart);
			$scope.loading = true;
			$scope.Message = "Generating Chart for " + chart.Name;
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

								   if (chart.QueryMode == 2) {
									   chartFactory.getGroupDatapoints(chart.ID)
										   .then(function (result) {

										       chart.Datapoints = JSON.parse(result);

											   drawChart(chart.ChartType,
											   chart.Interval,
											   chart.chartData,
											   chart.chartDataColumn,
											   chart.DataPoints, chart.chartdiv, true, $scope.$GeneralConfiguration.generalConfiguration().StartOfWeek);
											   $scope.loading = false;

										   });
								   }
								   else {
									   drawChart(chart.ChartType,
									   chart.Interval,
									   chart.chartData,
									   chart.chartDataColumn,
									   chart.DataPoints, chart.chartdiv, true, $scope.$GeneralConfiguration.generalConfiguration().StartOfWeek);
									   $scope.loading = false;
								   }

							   });
		}

		$scope.changeInterval = function (Chart, Window) {
			var chart = angular.copy(Chart);
			var window = angular.copy(Window.value);
			$scope.loading = true;
			$scope.Message = "Generating Chart for " + chart.Name;
			chart.UserChart = true;
			chart = removeAllBlankOrNull(chart);
			chartFactory.getLogs(chart)
							   .then(function (result) {
								   chart.chartdiv = "chartdiv" + chart.ID;
								   result = JSON.parse(result);

								   /*
										pick the logs for the selected window based on interval
								   */

								   var dps = [];
								   for (i = 0; i < result.length; i++)
								   {
									   /*
										result[i].Date;
									   */
									   var dpDate = new Date(result[i].Date);
									   if (chart.Interval == 1)
									   {
										   //minute
										   if (dpDate.getMinutes() == window)
											   dps.push(result[i]);
									   }
									   else if (chart.Interval == 2)
									   {
										   //hour
										   if (dpDate.getHours() == window)
											   dps.push(result[i]);
									   }
									   else if (chart.Interval == 3)
									   {
										   //day
										   if (dpDate.getDate() == window)
											   dps.push(result[i]);
									   }
									   else if (chart.Interval == 4)
									   {
										   //week
										   if (dpDate.getDay() == window)
											   dps.push(result[i]);
									   }
									   else if (chart.Interval == 5)
									   {
										   //month
										   if (dpDate.getMonth() == window-1)
											   dps.push(result[i]);
									   }
									   else if (chart.Interval == 6)
									   {
										   //year
										   if (dpDate.getYear() == window)
											   dps.push(result[i]);
									   }
								   }

								   



								   chart.chartData = dps;
								   $scope.chartData = dps;
								   if (dps != "" && dps != null && dps != []) {
									   chart.chartDataColumn = Object.keys(dps[0]);
									   $scope.chartDataColumn = chart.chartDataColumn;
								   }

								   if (chart.QueryMode == 2) {
									   chartFactory.getGroupDatapoints(chart.ID)
										   .then(function (result) {

										       chart.Datapoints = JSON.parse(result);

											   //drawChart(chart.ChartType,
											   //chart.Interval,
											   //chart.chartData,
											   //chart.chartDataColumn,
											   //chart.DataPoints, chart.chartdiv);

											   var divpie = chart.chartdiv + "pie";
												   //pie
												   drawChart(4,
												   chart.Interval,
												   chart.chartData,
												   chart.chartDataColumn,
												   chart.DataPoints, divpie, true, $scope.$GeneralConfiguration.generalConfiguration().StartOfWeek);
												   var divline = chart.chartdiv + "line";
												   //line
												   drawChart(3,
												  chart.Interval,
												  chart.chartData,
												  chart.chartDataColumn,
												  chart.DataPoints, divline, true, $scope.$GeneralConfiguration.generalConfiguration().StartOfWeek);

											   $scope.loading = false;

										   });
								   }
								   else {
									   //drawChart(chart.ChartType,
									   //chart.Interval,
									   //chart.chartData,
									   //chart.chartDataColumn,
									   //chart.DataPoints, chart.chartdiv);

									   var divpie = chart.chartdiv + "pie";
									   //pie
									   drawChart(4,
									   chart.Interval,
									   chart.chartData,
									   chart.chartDataColumn,
									   chart.DataPoints, divpie, true, $scope.$GeneralConfiguration.generalConfiguration().StartOfWeek);
									   var divline = chart.chartdiv + "line";
									   //line
									   drawChart(3,
									  chart.Interval,
									  chart.chartData,
									  chart.chartDataColumn,
									  chart.DataPoints, divline, true, $scope.$GeneralConfiguration.generalConfiguration().StartOfWeek);

									   $scope.loading = false;
								   }

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

		function compareDate(date, interval)
		{

			//$scope.logIntervals = [{ "Name": "Minute", "value": 1 },
			//              { "Name": "Hour", "value": 2 },
			//              { "Name": "Day", "value": 3 },
			//              { "Name": "Week", "value": 4 },
			//              { "Name": "Month", "value": 5 },
			//              { "Name": "Year", "value": 6 }];

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
			chart.uploadButton = "chart" + chart.ID + "upload";
			dashboardFactory.getLogs(chart.ID)
			   .then(function (result) {

				   chart.chartData = result;
				   if (result != "") {
					   chart.chartDataColumn = Object.keys(result[0]);
				   }

				   if (chart.QueryMode == 2) {
					   dashboardFactory.getGroupChartDataPoints(chart.ID)
						   .then(function (result) {

						       chart.Datapoints = JSON.parse(result);

							   drawChart(chart.ChartType,
							   chart.Interval,
							   chart.chartData,
							   chart.chartDataColumn,
							   chart.DataPoints, chart.chartdiv, true, $scope.$GeneralConfiguration.generalConfiguration().StartOfWeek);
							   $scope.loading = false;

						   });
				   }
				   else {
					   drawChart(chart.ChartType,
					   chart.Interval,
					   chart.chartData,
					   chart.chartDataColumn,
					   chart.DataPoints, chart.chartdiv, true, $scope.$GeneralConfiguration.generalConfiguration().StartOfWeek);
					   $scope.loading = false;
				   }

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
		
		$scope.createDiscussion = function (discussionMessage, chart, attachment)
		{
			
			if (isExist(chart, $scope.discussionCharts))
			{
				var index = {};
				for (i = 0; i < $scope.discussionCharts.length; i++)
				{
					if (chart.ID == $scope.discussionCharts[i].ID)
						index = i;
				}
				$scope.sendReply($scope.discussionCharts[index].DiscussionBoard.ID, discussionMessage, $scope.discussionCharts[index],attachment);
				$('#' + chart.ChartModal).modal('hide');
			   
			}
			else
			{
				var entity = { "Chart": chart, "DiscussionMessage": discussionMessage, "userID": $scope.loggedUser.UserId };
				discussionsFactory.saveChanges(entity)
			   .then(function (result) {
			       if (typeof result == "string")
			           result = JSON.parse(result);
			       if (result)
			       {
			           toastr.success("Discussion Message Sent", "Success!");
			           if (attachment != undefined && attachment != null && attachment != "") {
			               $scope.uploadAttachment(attachment, result.ID, chart);
			           }
			           else {
			               chart.DiscussionBoard = result;
			               $('#' + chart.ChartModal).modal('hide');
			               chart.Message = "";
			               chart.attachmentfile = null;
			               chart.AttachmentName = "";
			               $scope.reloadDiscussionBoard(chart);
			           }
			           
			       }
				   else
					   toastr.error("Fail to send Discussion Message", "Error");

				   $scope.reloadPage();
			   });
			}
			
		}

		$scope.sendReply = function(discussionId,discussionMessage,chart,attachment)
		{
			var entity = { "DiscussionId": discussionId, "DiscussionMessage": discussionMessage, "userID": $scope.loggedUser.UserId };
			
			discussionsFactory.saveChanges(entity)
			.then(function (result) {
			    if (typeof result == "string")
			        result = JSON.parse(result);

			    if (result != false)
			    {
			        toastr.success("Discussion Message Sent", "Success!");
			        if (attachment != undefined && attachment != null && attachment != "")
			        {		            
			            $scope.uploadAttachment(attachment, result.ID, chart);
			        }
			        else
			        {
			            $('#' + chart.ChartModal).modal('hide');
			            chart.Message = "";
			            chart.attachmentfile = null;
			            chart.AttachmentName = "";
			            $scope.reloadDiscussionBoard(chart);
			        }
			        
			    }
					
				else
				{
			        toastr.error("Fail to send Discussion Message", "Error");

			        $('#' + chart.ChartModal).modal('hide');
			        chart.Message = "";
			        chart.attachmentfile = null;
			        chart.AttachmentName = "";
			        $scope.reloadDiscussionBoard(chart);
			        
				}
				    

				
			});
		}

		$scope.uploadAttachment = function ($files, id,chart) {

		    //$files: an array of files selected, each file has name, size, and type.
		    chart.ChartModal = "chartdiscussion" + chart.ID + "modal";
		    for (var i = 0; i < $files.length; i++) {
		        var file = $files[i];
		        vm.upload = discussionsFactory.uploadAttachment(file, id)
                .progress(function (evt) {

                }).success(function (data, status, headers, config) {
                    toastr.success('Uploaded attachment successfully ');
                    $('#' + chart.ChartModal).modal('hide');
                    chart.Message = "";
                    chart.attachmentfile = null;
                    chart.AttachmentName = "";
                    $scope.reloadDiscussionBoard(chart);
                }).error(function (err) {
                    toastr.error('Error occured during attachment upload');
                    $('#' + chart.ChartModal).modal('hide');
                    chart.Message = "";
                    chart.attachmentfile = null;
                    chart.AttachmentName = "";
                    $scope.reloadDiscussionBoard(chart);
                });

		    }
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

		$scope.downloadFile = function (attachment) {
		    discussionsFactory.downloadAttachment(attachment);
		
		};

		$scope.clickUploadAttachment = function (chart) {
		    $('#' + chart.uploadButton).click();
		}
		$scope.updateAttachmentFileName = function (chart) {
		    var size = chart.attachmentfile[0].size;
		    if (size > 32768)
		    {
		        toastr.warning("File too large", "Warning");
		        chart.attachmentfile = null;
		    }
            else
		        chart.AttachmentName = chart.attachmentfile[0].name;
		    //$scope.backgroundImageFileName = $scope.backgroundImageFile[0].name;
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