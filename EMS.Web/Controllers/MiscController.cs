using EMS.BusinessLogic.Security;
using EMS.Common;
using EMS.Model.Security;
using EMS.Web.DTO;
using EMS.Web.Helpers;
using EMS.Web.Model;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace EMS.Web.Controllers
{
    [RoutePrefix("api/misc")]
    public class MiscController : ApiController
    {
        private IAuthentication _authFactory;
        private IUserBL _userBL;
        private const string _logoDump = "~/Dump/Logo/";
        private const string _bgDump = "~/Dump/Background/";
        private const string _iconDump = "~/Dump/Icon/";
        public MiscController()
        {
            _authFactory = EMSContainer.Resolve<IAuthentication>();
            _userBL = EMSContainer.Resolve<IUserBL>();
        }

        [Route("hasDefaultLogo"), HttpGet]
        public bool HasDefaultLogo()
        {
            var logo = _userBL.GetLogo(1);

            if (logo == null) return false;
            return true;
        }
        
        [Route("hasLogo"), HttpGet]
        public bool HasLogo()
        {
            var user = _authFactory.GetUserData();

            if (user == null) return false;

            var logo = _userBL.GetLogo(user.UserID);

            if (logo == null) return false;

            return true;
        }

        [Route("getlogo")]
        public HttpResponseMessage GetLogo(string stamp)
        {
            var user = _authFactory.GetUserData();

            if (user == null) return Request.CreateResponse(HttpStatusCode.Unauthorized);

            var logo = _userBL.GetLogo(user.UserID);

            if (logo == null) return Request.CreateResponse(HttpStatusCode.NotFound);

            var response = new HttpResponseMessage();

            byte[] byteLogo = File.ReadAllBytes(string.Format("{0}/{1}", HttpContext.Current.Server.MapPath(_logoDump), logo));
            response.Content = new StreamContent(new MemoryStream(byteLogo, 0, byteLogo.Length));
            response.Content.Headers.ContentType = MiscHelper.GetMediaTypeHeaderValue(logo);
            return response;
        }

        [Route("getbackgroundimage")]
        public HttpResponseMessage GetBackgroundImage(string stamp)
        {
            var user = _authFactory.GetUserData();

            if (user == null) return Request.CreateResponse(HttpStatusCode.Unauthorized);

            var bgImage = _userBL.GetBackgroundImage(user.UserID);

            if (bgImage.Value == null) return Request.CreateResponse(HttpStatusCode.NotFound);
            else if (!bgImage.Value.Equals(stamp)) return Request.CreateResponse(HttpStatusCode.NotFound);

            var response = new HttpResponseMessage();

            byte[] byteImage = File.ReadAllBytes(string.Format("{0}/{1}", HttpContext.Current.Server.MapPath(_bgDump), bgImage.Value));
            response.Content = new StreamContent(new MemoryStream(byteImage, 0, byteImage.Length));
            response.Content.Headers.ContentType = MiscHelper.GetMediaTypeHeaderValue(bgImage.Value);
            return response;
        }

        [Route("getdefaultbackgroundimage")]
        public HttpResponseMessage GetDefaultBackgroundImage(string stamp)
        {
            var bgImage = _userBL.GetBackgroundImage(1);

            if (bgImage.Value == null) return Request.CreateResponse(HttpStatusCode.NotFound);
            else if (!bgImage.Value.Equals(stamp)) return Request.CreateResponse(HttpStatusCode.NotFound);

            var response = new HttpResponseMessage();

            byte[] byteImage = File.ReadAllBytes(string.Format("{0}/{1}", HttpContext.Current.Server.MapPath(_bgDump), bgImage.Value));
            response.Content = new StreamContent(new MemoryStream(byteImage, 0, byteImage.Length));
            response.Content.Headers.ContentType = MiscHelper.GetMediaTypeHeaderValue(bgImage.Value);
            return response;
        }

        [Route("getdefaultlogo"), HttpGet]
        public HttpResponseMessage GetDefaultLogo(string stamp)
        {
            var logo = _userBL.GetLogo(1);

            if (logo == null) return Request.CreateResponse(HttpStatusCode.NotFound);

            var response = new HttpResponseMessage();
            byte[] byteLogo = File.ReadAllBytes(string.Format("{0}/{1}", HttpContext.Current.Server.MapPath(_logoDump), logo));
            response.Content = new StreamContent(new MemoryStream(byteLogo, 0, byteLogo.Length));
            response.Content.Headers.ContentType = MiscHelper.GetMediaTypeHeaderValue(logo);
            return response;
        }

        [Route("getdefaultbgstamp"), HttpGet]
        public JBackground GetDefaultBackgroundImageStamp()
        {
            var image = _userBL.GetBackgroundImage(1);

            return image.Value != null ? new JBackground
            {
                Style = image.Key,
                Stamp = image.Value
            } : null;
        }

        [Route("getbgstamp"), HttpGet]
        public JBackground GetBackgroundImageStamp()
        {
            //To avoid downloading heavy images all the time
            var user = _authFactory.GetUserData();

            if (user == null) throw new UnauthorizedAccessException();

            var bgImageStamp = _userBL.GetBackgroundImage(user.UserID);

            return bgImageStamp.Value != null ? new JBackground
            {
                Style = bgImageStamp.Key,
                Stamp = bgImageStamp.Value
            } : null;
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
                    //
                }
            }
            else result = Request.CreateResponse(HttpStatusCode.BadRequest);
            return result;
        }

        [AjaxAuthorize(Roles = Roles.System.Logo.ModifyCreate)]
        [Route("uploadLogo"), HttpPost]
        public HttpResponseMessage UploadLogo(int userID)
        {
            if (_authFactory.GetUserData() == null) return Request.CreateResponse(HttpStatusCode.Unauthorized);

            string file;
            var response = SaveFile(HttpContext.Current.Request, _logoDump, out file);

            if (file != null)
            {
                var result = _userBL.UpdateLogo(userID, file);
                if (!result.Successful) return Request.CreateResponse(HttpStatusCode.BadRequest);
            }
            else return Request.CreateResponse(HttpStatusCode.BadRequest);

            return response;
        }

        [AjaxAuthorize(Roles = Roles.System.BackgroundImage.ModifyCreate)]
        [Route("uploadBackground"), HttpPost]
        public HttpResponseMessage UploadBackground(int userID)
        {
            if(_authFactory.GetUserData() == null) return Request.CreateResponse(HttpStatusCode.Unauthorized);

            string file;
            var response = SaveFile(HttpContext.Current.Request, _bgDump, out file);

            if (file != null)
            {
                var result = _userBL.UpdateBackgroundImage(userID, file);
                if (!result.Successful) return Request.CreateResponse(HttpStatusCode.BadRequest);
            }
            else return Request.CreateResponse(HttpStatusCode.BadRequest);

            return response;
        }

        [AjaxAuthorize(Roles = Roles.FolderDatapointManagement.FoldersDatapoints.ModifyCreate)]
        [Route("uploadIcon"), HttpPost]
        public HttpResponseMessage UploadIcon(int id)
        {
            if (_authFactory.GetUserData() == null) return Request.CreateResponse(HttpStatusCode.Unauthorized);

            var request = HttpContext.Current.Request;
            var dumpLocation = _iconDump + id + "/";

            HttpResponseMessage result = null;

            if (request.Files.Count > 0)
            {
                try
                {
                    var docfiles = new List<string>();
                    foreach (string file in request.Files)
                    {
                        var postedFile = request.Files[file];
                        var filePath = HttpContext.Current.Server.MapPath(dumpLocation);

                        if (!File.Exists(filePath))
                        {
                            Directory.CreateDirectory(filePath);
                        }

                        postedFile.SaveAs(
                            string.Format("{0}/{1}", filePath, postedFile.FileName));

                        docfiles.Add(postedFile.FileName);
                    }
                    result = Request.CreateResponse(HttpStatusCode.Created, docfiles);
                }
                catch (Exception ex)
                {
                    //
                }
            }
            else result = Request.CreateResponse(HttpStatusCode.BadRequest);

            return result;
        }
    }
}
