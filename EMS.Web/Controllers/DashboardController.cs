using EMS.BusinessLogic.DataPoint;
using EMS.Common;
using EMS.Model.DatapointManagement;
using EMS.Model.Security;
using EMS.Web.Model;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace EMS.Web.Controllers
{
	public class DashboardController : Controller
	{
		private static readonly IUserChartBL UserChartBL = EMSContainer.Resolve<IUserChartBL>();
		private static readonly IUserChartDataPointBL UserChartDatapointBL = EMSContainer.Resolve<IUserChartDataPointBL>();
		private static readonly IUserTemplateBL UserTemplateBL = EMSContainer.Resolve<IUserTemplateBL>();
        private static readonly IVariableTreeBL VariableTreeBL = EMSContainer.Resolve<IVariableTreeBL>();
        private static readonly ILogBL LogBL = EMSContainer.Resolve<ILogBL>();
		//
		// GET: /Dashboard/
		public ActionResult Index()
		{
			return View();
		}

        [AjaxAuthorize(Roles = Roles.TemplateManagement.Templates.ModifyCreate)]
		[HttpGet,ActionName("getTemplate")]
		public string GetActiveTemplate(string value)
		{
			var rawValue = JsonConvert.DeserializeObject<string>(value);
			var userId = Convert.ToInt32(rawValue);
            var template = UserTemplateBL.GetActiveTemplateByUser(userId);
            if (template != null)
                return JsonConvert.SerializeObject(template);
            else
                return null;

		}

        [AjaxAuthorize(Roles = Roles.TemplateManagement.Templates.ModifyCreate)]
		[HttpGet,ActionName("getCharts")]
		public string GetChartsInActiveTemplate(string value)
		{
			var rawValue = JsonConvert.DeserializeObject<string>(value);
			var templateId = Convert.ToInt32(rawValue);
			var templateCharts = UserChartBL.GetCharts(templateId);
			foreach(var chart in templateCharts)
			{
				chart.Template = null;
			}
			return JsonConvert.SerializeObject(templateCharts,Formatting.Indented,
				new JsonSerializerSettings
				{
					ReferenceLoopHandling = ReferenceLoopHandling.Ignore
				});
		}

        [AjaxAuthorize(Roles = Roles.TemplateManagement.Templates.ModifyCreate)]
		[HttpGet,ActionName("getChartDataPoints")]
		public string GetUserChartDataPoints(string value)
		{
			var rawValue = JsonConvert.DeserializeObject<string>(value);
			var chartId = Convert.ToInt32(rawValue);
            var datapoints = UserChartDatapointBL.GetChartDatapoints(chartId);
            var dp = new List<VariableTree>();
            if (datapoints != null)
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

        [AjaxAuthorize(Roles = Roles.TemplateManagement.Templates.ModifyCreate)]
        [HttpGet, ActionName("getGroupChartDataPoints")]
        public string getUserGroupDatapointForChart(string value)
        {
            var rawValue = JsonConvert.DeserializeObject<string>(value);
            if (rawValue != null)
            {
                var chartId = Convert.ToInt32(rawValue.ToString());
                var datapoints = UserChartDatapointBL.GetChartDatapointsParentVariableTree(chartId);

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

            var id = Convert.ToInt32(value);
            var chart = UserChartBL.GetSpecificChart(id);
            var datapoints = UserChartDatapointBL.GetChartDatapoints(id);
            var dp = new List<VariableTree>();
            if (datapoints != null)
            {
                foreach (var x in datapoints)
                {
                    dp.Add(VariableTreeBL.GetVariableTree(x.VariableTreeID));
                }

            }

            return LogBL.GetLogs(chart,dp);
        }

	}
}