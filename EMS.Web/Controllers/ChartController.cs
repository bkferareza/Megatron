using EMS.BusinessLogic.DataPoint;
using EMS.BusinessLogic.Security;
using EMS.Common;
using EMS.Model;
using EMS.Model.DatapointManagement;
using EMS.Model.Enum;
using EMS.Model.Security;
using EMS.Web.Helpers;
using EMS.Web.Model;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace EMS.Web.Controllers
{
    [RoutePrefix("api/chart")]
    public class ChartController : ApiController
    {
        private static readonly IChartsBL ChartBL = EMSContainer.Resolve<IChartsBL>();
        private static readonly ITemplateBL TemplateBL = EMSContainer.Resolve<ITemplateBL>();
        private static readonly IChartDatapointBL ChartDatapointBL = EMSContainer.Resolve<IChartDatapointBL>();
        private static readonly IVariableTreeBL VariableTreeBL = EMSContainer.Resolve<IVariableTreeBL>();
        private static readonly ILogBL LogBL = EMSContainer.Resolve<ILogBL>();
        private static readonly IUserChartBL UserChartBL = EMSContainer.Resolve<IUserChartBL>();
        private static readonly TimeZone localZone = TimeZone.CurrentTimeZone;

        [AjaxAuthorize(Roles = Roles.TemplateManagement.Templates.ModifyCreate)]
        [HttpGet,Route("getCharts")]
        public string GetChartPerTemplate(string value)
        {
            var rawValue = JsonConvert.DeserializeObject<string>(value);
            if (rawValue != null)
            {
                var templateId = Convert.ToInt32(rawValue.ToString());
                var charts = ChartBL.GetCharts(templateId);
                
                return (charts != null)?JsonConvert.SerializeObject(charts,Formatting.None,
                        new JsonSerializerSettings()
                        {
                            ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                        }):null;
            }

            return null;
        }

        [AjaxAuthorize(Roles = Roles.TemplateManagement.Templates.ModifyCreate)]
        [HttpGet, Route("getSpecificChart")]
        public string GetSpectificByID(string value)
        {
             var rawValue = JsonConvert.DeserializeObject<Dictionary<string, object>>(value);
             if (rawValue.ContainsKey("ID"))
             {
                 var id = Convert.ToInt32(rawValue["ID"].ToString());
                 return JsonConvert.SerializeObject(ChartBL.GetSpecificChart(id));
             }
             return null;
        }

        [AjaxAuthorize(Roles = Roles.TemplateManagement.Templates.ModifyCreate)]
        [HttpGet, Route("getSpecificChart")]
        public string GetSpectificByName(string value)
        {
             var rawValue = JsonConvert.DeserializeObject<Dictionary<string, object>>(value);
             if (rawValue.ContainsKey("ID"))
             {
                 var chartName = rawValue["Name"].ToString();
                 return JsonConvert.SerializeObject(ChartBL.GetSpecificChart(chartName));
             }
             return null;
        }

        [AjaxAuthorize(Roles = Roles.TemplateManagement.Templates.ModifyCreate)]
        [HttpGet, Route("newChart")]
        public string newChart()
        {
            return JsonConvert.SerializeObject(ChartBL.NewChart());
        }

        [AjaxAuthorize(Roles = Roles.TemplateManagement.Templates.ModifyCreate)]
        [HttpPost, Route("savechanges")]
        public bool SaveChanges(string value)
        {
            var rawValue = JsonConvert.DeserializeObject<Dictionary<string, object>>(value);
            TemplateChart chart = new TemplateChart();
            
      
            

            if (rawValue.ContainsKey("ID"))
            {
                var id = Convert.ToInt32(rawValue["ID"].ToString());
                if (id > 0)
                {
                    chart = ChartBL.GetSpecificChart(id);
                    //ChartBL.DeleteChart(chart);
                }
            }

            chart.Name = rawValue["Name"].ToString();
            var interval = JsonConvert.DeserializeObject<string>(rawValue["Interval"].ToString());
            var chartType = JsonConvert.DeserializeObject<string>(rawValue["ChartType"].ToString());
            var queryMode = JsonConvert.DeserializeObject<string>(rawValue["QueryMode"].ToString());
            chart.Interval = (Interval)Enum.Parse(typeof(Interval), interval);
            chart.ChartType = (ChartType)Enum.Parse(typeof(ChartType), chartType);
            chart.QueryMode = (QueryMode)Enum.Parse(typeof(QueryMode), queryMode);

            if (rawValue.ContainsKey("RangeOption"))
            {
                var rangeOption = JsonConvert.DeserializeObject<string>(rawValue["RangeOption"].ToString());
                chart.RangeOption = (RangeOptions)Enum.Parse(typeof(RangeOptions), rangeOption);

            }
            if (rawValue.ContainsKey("RangeType"))
            {
                var rangeType = rawValue["RangeType"].ToString();
                chart.RangeType = (RangeType)Enum.Parse(typeof(RangeType), rangeType);

            }
            if (rawValue.ContainsKey("RangeFrom") && rawValue.ContainsKey("RangeTo") && chart.RangeType != RangeType.Repeated)
            {


                
                var from = rawValue["RangeFrom"].ToString();
                var to = rawValue["RangeTo"].ToString();

                chart.RangeFrom = localZone.ToLocalTime(Convert.ToDateTime(from));
                chart.RangeTo = localZone.ToLocalTime(Convert.ToDateTime(to));

            }

            if(rawValue.ContainsKey("AggregateOptionNormal"))
            {
                var aggregateOptionNormal = JsonConvert.DeserializeObject<string>(rawValue["AggregateOptionNormal"].ToString());
                chart.AggregateOptionNormal = (AggregateOptions)Enum.Parse(typeof(AggregateOptions), aggregateOptionNormal);
            }

            if(rawValue.ContainsKey("AggregateOptionFaulty"))
            {
                var aggregateOptionFaulty = JsonConvert.DeserializeObject<string>(rawValue["AggregateOptionFaulty"].ToString());
                chart.AggregateOptionFaulty =(AggregateOptions)Enum.Parse(typeof(AggregateOptions), aggregateOptionFaulty);
                
            }

            if (rawValue.ContainsKey("RangeXValue"))
            {
                var rangeOptionXValue = Convert.ToInt32(rawValue["RangeXValue"].ToString()) * -1;
                chart.RangeOptionXValue = (byte)(rangeOptionXValue * -1);

            }

            #region Repeated Values
            if (chart.AggregateOptionNormal == AggregateOptions.Specific)
            {
                //if (rawValue.ContainsKey("RangeXValue"))
                //{

                //    var rangeOptionXValue = Convert.ToInt32(rawValue["RangeXValue"].ToString()) * -1;
                //    chart.RangeOptionXValue = (byte)(rangeOptionXValue * -1);
                //    //computations here

                //    var moment = DateTime.Now;
                //    var month = DateTime.Now.Month;
                //    var day = DateTime.Now.Day;
                //    var dayOfWeek = DateTime.Now.DayOfWeek;
                //    var hour = DateTime.Now.Hour;
                //    var minute = DateTime.Now.Minute;
                //    //chart.RangeTo = DateTime.Now;
                //    //chart.RangeFrom = DateTime.Now;

                //    if (chart.Interval == Interval.Month)
                //    {

                //        moment = DateTime.Now.AddYears(rangeOptionXValue);
                //        if (rawValue.ContainsKey("Month"))
                //        {
                //            var m = JsonConvert.DeserializeObject<Dictionary<string, string>>(rawValue["Month"].ToString());
                //            month = Convert.ToInt32(m["value"]);
                //        }
                //        if (rawValue.ContainsKey("Day"))
                //        {
                //            day = Convert.ToInt32(rawValue["Day"].ToString());
                //        }
                //        if (rawValue.ContainsKey("Hours"))
                //        {
                //            hour = Convert.ToInt32(rawValue["Hours"].ToString());
                //        }
                //        if (rawValue.ContainsKey("Minutes"))
                //            minute = Convert.ToInt32(rawValue["Minutes"].ToString());


                //        chart.RangeValue = new DateTime(moment.Year, month, day, hour, minute, 0);
                //        //chart.RangeFrom = chart.RangeValue;

                //    }
                //    else if (chart.Interval == Interval.Day)
                //    {

                //        moment = DateTime.Now.AddMonths(rangeOptionXValue);
                //        if (rawValue.ContainsKey("Day"))
                //        {
                //            day = Convert.ToInt32(rawValue["Day"].ToString());
                //        }
                //        if (rawValue.ContainsKey("Hours"))
                //        {
                //            hour = Convert.ToInt32(rawValue["Hours"].ToString());
                //        }
                //        if (rawValue.ContainsKey("Minutes"))
                //            minute = Convert.ToInt32(rawValue["Minutes"].ToString());

                //        chart.RangeValue = new DateTime(moment.Year, moment.Month, day, hour, minute, 0);
                //        //chart.RangeFrom = chart.RangeValue;
                //    }
                //    else if (chart.Interval == Interval.Week)
                //    {

                //        if (rawValue.ContainsKey("weekDay"))
                //        {
                //            var weekDay = JsonConvert.DeserializeObject<Dictionary<string, string>>(rawValue["weekDay"].ToString());
                //            var selectedDay = Convert.ToInt32(weekDay["value"]) - 1;
                //            var today = DateTime.Now;
                //            var dayToday = (int)today.DayOfWeek;
                //            var difference = dayToday - selectedDay;
                //            var totalDays = rangeOptionXValue * 7;

                //            if (selectedDay < dayToday)
                //            {
                //                totalDays = totalDays + difference;
                //            }
                //            else
                //            {
                //                totalDays = totalDays - difference;
                //            }

                //            moment = DateTime.Now.AddDays(totalDays);
                //            if (rawValue.ContainsKey("Hours"))
                //                hour = Convert.ToInt32(rawValue["Hours"].ToString());
                //            if (rawValue.ContainsKey("Minutes"))
                //                minute = Convert.ToInt32(rawValue["Minutes"].ToString());
                //        }

                //        chart.RangeValue = new DateTime(moment.Year, moment.Month, moment.Day, hour, minute, 0);
                //        //chart.RangeFrom = chart.RangeValue;
                //    }
                //    else if (chart.Interval == Interval.Hour)
                //    {

                //        moment = DateTime.Now.AddDays(rangeOptionXValue);
                //        if (rawValue.ContainsKey("Hours"))
                //            hour = Convert.ToInt32(rawValue["Hours"].ToString());
                //        if (rawValue.ContainsKey("Minutes"))
                //            minute = Convert.ToInt32(rawValue["Minutes"].ToString());

                //        chart.RangeValue = new DateTime(moment.Year, moment.Month, moment.Day, hour, minute, 0);
                //        //chart.RangeFrom = chart.RangeValue;

                //    }
                //    else if (chart.Interval == Interval.Minute)
                //    {

                //        moment = DateTime.Now.AddHours(rangeOptionXValue);
                //        if (rawValue.ContainsKey("Minutes"))
                //            minute = Convert.ToInt32(rawValue["Minutes"].ToString());

                //        chart.RangeValue = new DateTime(moment.Year, moment.Month, moment.Day, moment.Hour, minute, 0);
                //        //chart.RangeFrom = chart.RangeValue;
                //    }



                //}
                //else
                //{
                    var moment = DateTime.Now;
                    var month = DateTime.Now.Month;
                    var day = DateTime.Now.Day;
                    var dayOfWeek = DateTime.Now.DayOfWeek;
                    var hour = DateTime.Now.Hour;
                    var minute = DateTime.Now.Minute;
                    // chart.RangeTo = DateTime.Now;
                    // chart.RangeFrom = DateTime.Now;
                    if (chart.Interval == Interval.Year)
                    {
                        if (rawValue.ContainsKey("Month"))
                        {
                            var m = JsonConvert.DeserializeObject<Dictionary<string, string>>(rawValue["Month"].ToString());
                            month = Convert.ToInt32(m["value"]);
                        }
                        if (rawValue.ContainsKey("Day"))
                            day = Convert.ToInt32(rawValue["Day"].ToString());
                        if (rawValue.ContainsKey("Hours"))
                            hour = Convert.ToInt32(rawValue["Hours"].ToString());
                        if (rawValue.ContainsKey("Minutes"))
                            minute = Convert.ToInt32(rawValue["Minutes"].ToString());
                        chart.RangeValue = new DateTime(moment.Year, month, day, hour, minute, 0);
                        // chart.RangeFrom = chart.RangeValue;
                    }
                    else if (chart.Interval == Interval.Month)
                    {
                        //if (rawValue.ContainsKey("Month"))
                        //{
                        //    try
                        //    {
                        //        // var m = JsonConvert.DeserializeObject<Dictionary<string, string>>(rawValue["Month"].ToString());
                        //        month = Convert.ToInt32(rawValue["Month"]);
                        //    }
                        //    catch
                        //    {
                        //        month = Convert.ToInt32(rawValue["Month"]);
                        //    }
                        //}

                        if (rawValue.ContainsKey("Day"))
                            day = Convert.ToInt32(rawValue["Day"].ToString());
                        if (rawValue.ContainsKey("Hours"))
                            hour = Convert.ToInt32(rawValue["Hours"].ToString());
                        if (rawValue.ContainsKey("Minutes"))
                            minute = Convert.ToInt32(rawValue["Minutes"].ToString());
                        chart.RangeValue = new DateTime(moment.Year, month, day, hour, minute, 0);
                        // chart.RangeFrom = chart.RangeValue;
                    }
                    else if (chart.Interval == Interval.Day)
                    {

                        //if (rawValue.ContainsKey("Day"))
                        //    day = Convert.ToInt32(rawValue["Day"].ToString());
                        if (rawValue.ContainsKey("Hours"))
                            hour = Convert.ToInt32(rawValue["Hours"].ToString());
                        if (rawValue.ContainsKey("Minutes"))
                            minute = Convert.ToInt32(rawValue["Minutes"].ToString());
                        chart.RangeValue = new DateTime(moment.Year, moment.Month, day, hour, minute, 0);
                        //  chart.RangeFrom = chart.RangeValue;
                    }
                    else if (chart.Interval == Interval.Week)
                    {
                        var difference = 0;
                        if (rawValue.ContainsKey("weekDay"))
                        {
                            var weekDay = JsonConvert.DeserializeObject<Dictionary<string, string>>(rawValue["weekDay"].ToString());
                            var selectedDay = Convert.ToInt32(weekDay["value"]) - 1;

                            var dayToday = (int)moment.DayOfWeek;
                            difference = dayToday - selectedDay;

                            difference = difference * -1;
                        }

                        if (rawValue.ContainsKey("Hours"))
                            hour = Convert.ToInt32(rawValue["Hours"].ToString());
                        if (rawValue.ContainsKey("Minutes"))
                            minute = Convert.ToInt32(rawValue["Minutes"].ToString());
                        chart.RangeValue = new DateTime(moment.Year, moment.Month, moment.Day + difference, hour, minute, 0);
                        //chart.RangeFrom = chart.RangeValue;
                    }
                    else if (chart.Interval == Interval.Hour)
                    {

                        //if (rawValue.ContainsKey("Hours"))
                        //    hour = Convert.ToInt32(rawValue["Hours"].ToString());
                        if (rawValue.ContainsKey("Minutes"))
                            minute = Convert.ToInt32(rawValue["Minutes"].ToString());

                        chart.RangeValue = new DateTime(moment.Year, moment.Month, moment.Day, hour, minute, 0);
                        //chart.RangeFrom = chart.RangeValue;


                    }
                    else if (chart.Interval == Interval.Minute)
                    {

                        //if (rawValue.ContainsKey("Minutes"))
                        //{
                        //    if (rawValue["Minutes"] != null)
                        //    {
                        //        minute = Convert.ToInt32(rawValue["Minutes"].ToString());
                        //        chart.RangeValue = new DateTime(moment.Year, moment.Month, moment.Day, moment.Hour, minute, 0);
                        //    }
                        //}

                        // chart.RangeFrom = chart.RangeValue;
                    }

               // }
            }
            #endregion


            if (rawValue.ContainsKey("DataPoints"))
            {
                var dataPoints = JsonConvert.DeserializeObject<List<int>>(rawValue["DataPoints"].ToString());

                chart.Datapoints = new List<TemplateChartDataPoint>();
                foreach(var vt in dataPoints)
                {
                    var dp = new TemplateChartDataPoint { VariableTreeID = vt, ChartID = chart.ID };
                    chart.Datapoints.Add(dp);
                }
               

            }
            if (rawValue.ContainsKey("templateID"))
            {
                var templateId = rawValue["templateID"].ToString();
                chart.Template = TemplateBL.GetTemplate(Convert.ToInt32(templateId));

            }

            if(rawValue.ContainsKey("BenchmarkFrom"))
            {
                var benchmarkFrom = localZone.ToLocalTime(Convert.ToDateTime(rawValue["BenchmarkFrom"].ToString()));
                chart.BenchmarkFrom = benchmarkFrom;

            }

            if (rawValue.ContainsKey("BenchmarkTo"))
            {
                var benchmarkTo = localZone.ToLocalTime(Convert.ToDateTime(rawValue["BenchmarkTo"].ToString()));
                chart.BenchmarkTo = benchmarkTo;
            
            }

            if (rawValue.ContainsKey("RangeOptionBenchmark"))
            {
                var rangeOption = JsonConvert.DeserializeObject<string>(rawValue["RangeOptionBenchmark"].ToString());
                var option = (RangeOptions)Enum.Parse(typeof(RangeOptions), rangeOption);
                chart.RangeOptionBenchmark = option;

                if (rawValue.ContainsKey("RangeBenchmarkXValue"))
                {
                    var xValue = Convert.ToInt32(JsonConvert.DeserializeObject<string>(rawValue["RangeBenchmarkXValue"].ToString()));
                    chart.RangeOptionXValueBenchmark = xValue;
                }
            }

            if (rawValue.ContainsKey("RangeBenchMarkOption"))
            {
                var rangeOption = JsonConvert.DeserializeObject<string>(rawValue["RangeBenchMarkOption"].ToString());
                var option = (RangeOptions)Enum.Parse(typeof(RangeOptions), rangeOption);
                chart.RangeOptionBenchmark = option;
                if(rawValue.ContainsKey("RangeBenchmarkXValue"))
                {
                    var xValue = Convert.ToInt32(JsonConvert.DeserializeObject<string>(rawValue["RangeBenchmarkXValue"].ToString()));
                    chart.RangeOptionXValueBenchmark = xValue;
                    xValue = xValue * -1;
                    var today = DateTime.Now;
                    var computedDate = new DateTime(today.Year,today.Month,today.Day,today.Hour,today.Minute,today.Second);
                    chart.BenchmarkTo = DateTime.Now;
                    if(option == RangeOptions.LastXDay)
                    {
                      computedDate = computedDate.AddDays(xValue);
                    }
                    else if(option == RangeOptions.LastXHour)
                    {
                       computedDate = computedDate.AddHours(xValue * -1);
                    }
                    else if(option == RangeOptions.LastXMonth)
                    {
                       computedDate = computedDate.AddMonths(xValue);
                    }
                    else if(option == RangeOptions.LastXWeek)
                    {
                        xValue = xValue * 7;
                        computedDate = computedDate.AddDays(xValue);
                    }
                    else if(option == RangeOptions.LastXYear)
                    {
                        computedDate = computedDate.AddYears(xValue);
                    }
                    chart.BenchmarkFrom = computedDate;
                }
            }
            if (rawValue.ContainsKey("UserChart"))
            {

            }
            else
            {
                if (ChartBL.SaveChanges(chart).Successful)
                {
                    return true;
                }
            }
            

            return false;
        }

        [AjaxAuthorize(Roles = Roles.TemplateManagement.Templates.Delete)]
        [HttpPost, Route("deletechart")]
        public bool Delete(string value)
        {
          
                var id = Convert.ToInt32(value);
                if(id > 0)
                {
                    var chart = ChartBL.GetSpecificChart(id);
                    ChartBL.DeleteChart(chart);
                    return true;
                }
                return false;
        }

        [AjaxAuthorize(Roles = Roles.FolderDatapointManagement.FoldersDatapoints.ModifyCreate)]
        [HttpGet,Route("getdatapoints")]
        public string getDatapointForChart(string value)
        {
            var rawValue = JsonConvert.DeserializeObject<string>(value);
            if (rawValue != null)
            {
                var chartId = Convert.ToInt32(rawValue.ToString());
                var datapoints = ChartDatapointBL.GetChartDatapoints(chartId);
                var dp = new List<VariableTree>();
                if(datapoints != null)
                {
                    foreach (var x in datapoints)
                    {
                        dp.Add(VariableTreeBL.GetVariableTree(x.VariableTreeID));
                    }

                }
                return (datapoints != null) ? JsonConvert.SerializeObject(dp, Formatting.None,
                        new JsonSerializerSettings()
                        {
                            ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                        }) : null;
            }

            return null;
        }

        [AjaxAuthorize(Roles = Roles.FolderDatapointManagement.FoldersDatapoints.ModifyCreate)]
        [HttpGet, Route("getGroupDatapoints")]
        public string getGroupDatapointForChart(string value)
        {
            var rawValue = JsonConvert.DeserializeObject<string>(value);
            if (rawValue != null)
            {
                var chartId = Convert.ToInt32(rawValue.ToString());
                var datapoints = ChartDatapointBL.GetChartDatapointsParentVariableTree(chartId);

                return (datapoints != null) ? JsonConvert.SerializeObject(datapoints, Formatting.None,
                        new JsonSerializerSettings()
                        {
                            ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                        }) : null;
            }

            return null;
        }

        [AjaxAuthorize(Roles = Roles.Tools.GenerateChartsandReports.ModifyCreate)]
        [ActionName("get-logs")]
        [HttpGet]
        public string GetLogs(string value)
        {
            var raw = JsonConvert.DeserializeObject<Dictionary<string,object>>(value);
            if(raw.ContainsKey("UserChart"))
            {
                var chart = JsonConvert.DeserializeObject<UserChart>(value);
                var datapoints = chart.Datapoints;
                var dp = new List<VariableTree>();
                if (datapoints != null)
                {
                    foreach (var x in datapoints)
                    {
                        var variable = VariableTreeBL.GetVariableTree(x.ID);
                        dp.Add(VariableTreeBL.GetVariableTree(variable.ID));
                    }

                }

                return LogBL.GetLogs(chart, dp);
            }
            else
            {
                var chart = JsonConvert.DeserializeObject<TemplateChart>(value);
                var datapoints = chart.Datapoints;
                var dp = new List<VariableTree>();
                if (datapoints != null)
                {
                    foreach (var x in datapoints)
                    {
                        var variable = VariableTreeBL.GetVariableTree(x.ID);
                        dp.Add(VariableTreeBL.GetVariableTree(variable.ID));
                    }

                }

                return LogBL.GetLogs(chart, dp);
            }
         }
            
    }
}