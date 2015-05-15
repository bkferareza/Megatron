using EMS.BusinessLogic.Aspects;
using EMS.BusinessLogic.DataPoint;
using EMS.BusinessLogic.Security;
using EMS.Common;
using EMS.Model.DatapointManagement;
using EMS.Model.Security;
using EMS.Web.Helpers;
using EMS.Web.Model;
using log4net;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;



namespace EMS.Web.Controllers
{
    [LogCall]
    [RoutePrefix("api/discussion")]
    public class DiscussionController : ApiController
    {
        private static readonly IUserChartBL UserChartBL = EMSContainer.Resolve<IUserChartBL>();
        private static readonly IDiscussionsBL DiscussionsBL = EMSContainer.Resolve<IDiscussionsBL>();
        private static readonly IDiscussionMessageBL DiscussionMessageBL = EMSContainer.Resolve<IDiscussionMessageBL>();
        private static readonly IUserChartDataPointBL UserChartDatapointBL = EMSContainer.Resolve<IUserChartDataPointBL>();
        private static readonly IVariableTreeBL VariableTreeBL = EMSContainer.Resolve<IVariableTreeBL>();
        private static readonly ILogBL LogBL = EMSContainer.Resolve<ILogBL>();
        private static readonly IUserBL UserBL = EMSContainer.Resolve<IUserBL>();
        private IAuthentication _authFactory;

      

        private const string _imgLocation = "~/Discussion/Images/";

        public DiscussionController()
        {
            _authFactory = EMSContainer.Resolve<IAuthentication>();
        }


        [AjaxAuthorize(Roles = Roles.DiscussionBoard.ParticipateinDiscussions.ModifyCreate)]
        [HttpGet, Route("getCharts")]
        public string GetChartsWithDiscussion(string value)
        {
            var userId = Convert.ToInt32(value);
            var groupId = UserBL.GetUser(userId).GroupID;
            var charts = DiscussionsBL.GetUserChartWithDiscussion(groupId);
            return JsonConvert.SerializeObject(charts,Formatting.None,
                        new JsonSerializerSettings()
                        {
                            ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                        });
        }

        /// <summary>
        /// Create first the Discussion Message before adding attachment
        /// </summary>
        /// <param name="messageID"></param>
        /// <returns></returns>
        [AjaxAuthorize(Roles = Roles.DiscussionBoard.ParticipateinDiscussions.ModifyCreate)]
        [HttpPost,Route("uploadAttachment")]
        public HttpResponseMessage UploadAttachment(int messageID)
        {
            if (_authFactory.GetUserData() == null)
               return Request.CreateResponse(HttpStatusCode.Unauthorized);
                

            string file;
            var response = SaveFile(HttpContext.Current.Request, _imgLocation, out file);

            if (file != null)
            {
                var message = DiscussionMessageBL.GetSpecificMessageById(messageID);
                message.Attachment = file;
                var result = DiscussionMessageBL.SaveChanges(message);
                if (!result.Successful) 
                    return Request.CreateResponse(HttpStatusCode.BadRequest);
            }
            else return Request.CreateResponse(HttpStatusCode.BadRequest);

            return response;
        }

        [AjaxAuthorize(Roles = Roles.DiscussionBoard.ParticipateinDiscussions.ModifyCreate)]
        [HttpPost,Route("SaveChanges")]
        public string SaveChanges(string value)
        {
            var rawValue = JsonConvert.DeserializeObject<Dictionary<string,object>>(value);
            if(rawValue.ContainsKey("DiscussionId"))
            {
                    var discussionId = Convert.ToInt32(rawValue["DiscussionId"].ToString());
                    var discussion = DiscussionsBL.GetSpecificDiscussion(discussionId);
                    var userID = Convert.ToInt32(rawValue["userID"]);
                    var message = rawValue["DiscussionMessage"].ToString();

                    var discussionMessage = new DiscussionMessage { DiscussionID = discussion.ID, Message = message,UserID = userID, Discussion = discussion };
                    var result = DiscussionMessageBL.SaveChanges(discussionMessage);
                    if(result.Successful)
                    {
                        return JsonConvert.SerializeObject(result.Entity
                            , Formatting.None, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });
                    }
                    return false.ToString();
                
            }
            else
            {
                var discussion = new Discussion();
                var chart = JsonConvert.DeserializeObject<UserChart>(rawValue["Chart"].ToString());
                var userID = Convert.ToInt32(rawValue["userID"]);
                discussion.UserChartID = chart.ID;
                var user = UserBL.GetUser(userID);
                discussion.GroupID = user.GroupID;
                var result = DiscussionsBL.SaveChanges(discussion);
                if (result.Successful)
                {
                    
                    var message = rawValue["DiscussionMessage"].ToString();

                    var discussionMessage = new DiscussionMessage{Discussion = result.Entity, 
                        DiscussionID = result.Entity.ID, 
                        Message = message, UserID = userID,
                    };
                    var res = DiscussionMessageBL.SaveChanges(discussionMessage);
                    if (res.Successful)
                    {
                        return JsonConvert.SerializeObject(res.Entity
                            , Formatting.None, new JsonSerializerSettings() { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });
                    }
                    return false.ToString();
                }
            }
            
            return false.ToString();
        }

        [AjaxAuthorize(Roles = Roles.DiscussionBoard.ParticipateinDiscussions.ModifyCreate)]
        [HttpGet, Route("getDiscussionMessage")]
        public string GetDiscussionMessage(string value)
        {
            var discussionId = Convert.ToInt32(value);
            return JsonConvert.SerializeObject(DiscussionMessageBL.GetDiscussionMessage(discussionId));
        }

        [AjaxAuthorize(Roles = Roles.DiscussionBoard.ParticipateinDiscussions.ModifyCreate)]
        [HttpGet, Route("getDiscussion")]
        public string GetDiscussion(string value)
        {
            var chartId = Convert.ToInt32(value);
            return JsonConvert.SerializeObject(DiscussionsBL.GetDiscussion(chartId));
        }

        [AjaxAuthorize(Roles = Roles.System.Users.ModifyCreate)]
        [HttpGet,Route("getUserInfo")]
        public string GetUserInfo(string value)
        {
            var userId = Convert.ToInt32(value);
            return JsonConvert.SerializeObject(UserBL.GetUser(userId));
        }


        private HttpResponseMessage SaveFile(HttpRequest request, string dumpLocation, out string sfile)
        {
            HttpResponseMessage result = null;
            sfile = null;

            if (request.Files.Count > 0)
            {
                try
                {
                    var docfiles = new List<string>();
                    foreach (string file in request.Files)
                    {
                        var postedFile = request.Files[file];
                        var filePath = HttpContext.Current.Server.MapPath(dumpLocation);
                        var fileName = DateTime.Now.ToString("yyyyMMddhhmmssffff");

                        sfile = string.Format("{0}.{1}", fileName, MiscHelper.GetFileExtension(postedFile.FileName));

                        postedFile.SaveAs(
                            string.Format("{0}/{1}", filePath, sfile));

                        docfiles.Add(postedFile.FileName);
                    }
                    result = Request.CreateResponse(HttpStatusCode.Created, docfiles);
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
            else result = Request.CreateResponse(HttpStatusCode.BadRequest);
            return result;
        }

        [AjaxAuthorize(Roles = Roles.DiscussionBoard.ParticipateinDiscussions.ModifyCreate)]
        [Route("getAttachment")]
        public HttpResponseMessage GetBackgroundImage(string filename)
        {
            var response = new HttpResponseMessage();

            byte[] byteImage = File.ReadAllBytes(string.Format("{0}/{1}", HttpContext.Current.Server.MapPath(_imgLocation), 
                                                    filename));
            response.Content = new StreamContent(new MemoryStream(byteImage, 0, byteImage.Length));
            response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("inline");
            response.Content.Headers.ContentDisposition.FileName = filename;
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
            return response;
        }


        
    }
}
