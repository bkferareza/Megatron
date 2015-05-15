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
using System.Web;
using System.Web.Mvc;

namespace EMS.Web.Controllers
{
    public class TemplateManagementController : Controller
    {
        //
        // GET: /TemplateManagement/
        private static readonly ITemplateBL TemplateBL = EMSContainer.Resolve<ITemplateBL>();
        private static readonly IAuthentication Authentication = EMSContainer.Resolve<IAuthentication>();
        private static readonly IUserBL UserBL = EMSContainer.Resolve<IUserBL>();
        private static readonly IChartsBL ChartBL = EMSContainer.Resolve<IChartsBL>();
        private static readonly IChartDatapointBL ChartDatapointBL = EMSContainer.Resolve<IChartDatapointBL>();
        private static readonly IUserChartBL UserChartBL = EMSContainer.Resolve<IUserChartBL>();
        private static readonly IUserChartDataPointBL UserChartDatapointBL = EMSContainer.Resolve<IUserChartDataPointBL>();
        private static readonly IUserTemplateBL UserTemplateBL = EMSContainer.Resolve<IUserTemplateBL>();

        [HttpGet]
        public ActionResult Index()
        {
            var user = Authentication.GetUserData();

            if (user == null) return null;

            return View();
        }

        [HttpGet, ActionName("templates")]
        public string GetTemplates()
        {
            var templates = TemplateBL.GetTemplates();
            return JsonConvert.SerializeObject(templates);
        }

        [AjaxAuthorize(Roles = Roles.TemplateManagement.Templates.Delete)]
        [HttpPost, ActionName("delete-template")]
        public ActionResult DeleteTemplate(string value)
        {
            var rawValue = JsonConvert.DeserializeObject<Dictionary<string, object>>(value);
            var template = TemplateBL.GetTemplate(Convert.ToInt32(rawValue["ID"].ToString()));
            TemplateBL.DeleteTemplate(template.ID);
            return Json(new { Successful = true });
        }

        [HttpGet, ActionName("get-template")]
        public string GetSpecificTemplate(string value)
        {
            var template = TemplateBL.GetTemplate(JsonConvert.DeserializeObject<string>(value));
            return JsonConvert.SerializeObject(template);
        }

        [AjaxAuthorize(Roles = Roles.TemplateManagement.Templates.ModifyCreate)]
        [HttpGet, ActionName("new-template")]
        public string NewTemplate()
        {
            return JsonConvert.SerializeObject(TemplateBL.CreateTemplate());
        }

        [AjaxAuthorize(Roles = Roles.TemplateManagement.Templates.ModifyCreate)]
        [HttpPost, ActionName("save-changes")]
        public ActionResult SaveChanges(string value)
        {
            var rawValue = JsonConvert.DeserializeObject<Dictionary<string, object>>(value);

            Template template = new Template();
            if (rawValue.ContainsKey("ID"))
            {
                var id = Convert.ToInt32(rawValue["ID"].ToString());
                if (id > 0)
                    template = TemplateBL.GetTemplate(id);
            }
            template.Name = rawValue["Name"].ToString();

            if (rawValue.ContainsKey("User"))
            {
                var user = JsonConvert.DeserializeObject<Dictionary<string, string>>(rawValue["User"].ToString());
                var userId = UserBL.GetUserByUserName(user["Username"]).ID;
                template.UserID = userId;
            }
            if (rawValue.ContainsKey("MonthFromWindow") && rawValue.ContainsKey("MonthToWindow"))
            {
                var monthFrom = Convert.ToInt32(rawValue["MonthFromWindow"].ToString());
                var monthTo = Convert.ToInt32(rawValue["MonthToWindow"].ToString());
                template.MonthFromWindow = (MonthlyWindow)monthFrom;
                template.MonthToWindow = (MonthlyWindow)monthTo;
            }
            if (rawValue.ContainsKey("WeekFromWindow") && rawValue.ContainsKey("WeekToWindow"))
            {
                var weekFrom = Convert.ToInt32(rawValue["WeekFromWindow"].ToString());
                var weekTo = Convert.ToInt32(rawValue["WeekToWindow"].ToString());
                template.WeekFromWindow = (WeeklyWindow)weekFrom;
                template.WeekToWindow = (WeeklyWindow)weekTo;
            }
            if (rawValue.ContainsKey("DayFromWindow") && rawValue.ContainsKey("DayToWindow"))
            {
                var dayFrom = Convert.ToInt32(rawValue["DayFromWindow"].ToString());
                var dayTo = Convert.ToInt32(rawValue["DayToWindow"].ToString());
                template.DayFromWindow = dayFrom;
                template.DayToWindow = dayTo;
            }
            if (rawValue.ContainsKey("HourFromWindow") && rawValue.ContainsKey("HourToWindow"))
            {
                var hourFrom = Convert.ToInt32(rawValue["HourFromWindow"].ToString());
                var hourTo = Convert.ToInt32(rawValue["HourToWindow"].ToString());
                template.HourFromWindow = hourFrom;
                template.HourToWindow = hourTo;
            }
            if(rawValue.ContainsKey("SpecialTemplate"))
            {
                template.SpecialTemplate = Convert.ToBoolean(rawValue["SpecialTemplate"].ToString());
            }

            var result = TemplateBL.SaveTemplate(template);
            return Json(new { Successful = true, Result = result });
        }

        [HttpPost,ActionName("activate-template")]
        public bool ActivateTemplate(string value)
        {
            var template = JsonConvert.DeserializeObject<Template>(value);
            try
            {
               
                    var userTemplate = EntityHelper.ConvertObjectToEntity(template,new UserTemplate());
                    userTemplate.ID = 0;
                    var userTemplateCreation = UserTemplateBL.SaveTemplate(userTemplate);
                    if (userTemplateCreation.Successful)
                    {
                        var chartList = ChartBL.GetCharts(template.ID);
                        var userChartList = new List<UserChart>();
                        var templateChartUserChart = new Dictionary<UserChart, TemplateChart>();
                        foreach (var chart in chartList)
                        {
                            var userChart = EntityHelper.ConvertObjectToEntity(chart, new UserChart());
                            templateChartUserChart.Add(userChart,chart);
                            userChart.TemplateID = userTemplateCreation.Entity.ID;
                            userChartList.Add(userChart);
                        }

                        foreach (var uc in userChartList)
                        {
                            var templateChart = templateChartUserChart[uc];
                            var dps = ChartDatapointBL.GetChartDatapoints(templateChart.ID);
                            if(dps != null)
                            {
                                var udps = new List<UserChartDataPoint>();
                                foreach (var dp in dps)
                                {
                                    var udp = new UserChartDataPoint();
                                    udp.Chart = uc;
                                    udp.ChartID = uc.ID;
                                    udp.VariableTree = dp.VariableTree;
                                    udp.VariableTreeID = dp.VariableTreeID;
                                    udps.Add(udp);
                                }
                                uc.Datapoints = udps;
                            }
                            uc.ID = 0;
                            var userChartCreationResult = UserChartBL.SaveChanges(uc);
                            if (!userChartCreationResult.Successful)
                            {
                                return false;
                            }
                        }
                        return true;
                    }


              
                 return false;
            }catch(Exception e)
            {
                throw e;
            }


           
        }

    }
}