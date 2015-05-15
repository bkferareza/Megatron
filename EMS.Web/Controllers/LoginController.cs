using log4net;
using System;
using System.Web.Mvc;
using System.Security.Cryptography;
using System.Text;
using System.Configuration;
using System.IO;
using EMS.BusinessLogic.Aspects;
using EMS.BusinessLogic.Security;
using EMS.Common;
using EMS.Model.Security;
using System.Web.Script.Serialization;
using Newtonsoft.Json;
using System.Collections.Generic;



namespace EMS.Web.Controllers
{
    [LogCall]
    [Authorize]
    public class LoginController : Controller
    {

        private static readonly IUserBL UserBL = EMSContainer.Resolve<IUserBL>();

        private static readonly ILog log = LogManager.GetLogger("LogCall");

        protected ILog Log
        {
            get
            {
                return log;
            }
        }

        [AllowAnonymous]
        public ActionResult Index()
        {
            //ViewBag.Action = "Login";
            //return View(new UserCredential());

            return View();
            
        }

        [ActionName("session-expired")]
        public ActionResult SessionExpired()
        {
            ViewBag.Action = "Login";
            return View("Index", new UserCredential());
        }

        [ActionName("error")]
        public ActionResult Error()
        {
            var authentication = EMSContainer.Resolve<IAuthentication>();
            authentication.Logout();
            ViewBag.Action = "Login";
            return View("Index", new UserCredential());
        }

        [AllowAnonymous]
        [HttpPost]
        public ActionResult Index([System.Web.Http.FromUri]string value)
        {
            UserCredential credentials = new JavaScriptSerializer().Deserialize<UserCredential>(value);
            try
            {
                //for debug
                //return Json(new { Result = LoginResult.Successful.ToString() });
                var result = UserBL.Login(credentials);

                

                if (result == LoginResult.Successful || result == LoginResult.ChangePassword)
                {
                    return Json(new { Result = result.ToString() });
                }
                else if(result == LoginResult.Inactive)
                {
                    return Json(new { Result = result.ToString(), Message = "Inactive account" });
                }
                else if (result == LoginResult.PasswordValidationFailure)
                {
                    return Json(new { Result = result.ToString(), Message = "Password Invalid" });
                }
                else
                {
                    return Json(new { Result = result.ToString(), Message = "Invalid account" });
                }
            }
            catch (Exception ex)
            {
                Log.Error("Error occured:", ex);
                return Json(new { Result = "LoginException", Message = "The database is down, Please try again later. If the problem persists contact the System Administrator." });
            }
        }

        [HttpGet,ActionName("logout")]
        public ActionResult Logout()
        {
            UserBL.Logout();
            return null;// RedirectToAction("Index");
        }

        [ActionName("form")]
        public ActionResult Form()
        {
            if (Request.IsAjaxRequest())
            {
                return PartialView("Login", new UserCredential());
            }
            else
            {
                ViewBag.Action = "Login";
                return View("Index", new UserCredential());
            }
        }

        [AllowAnonymous]
        [ActionName("forgot-password")]
        public ActionResult ForgotPassword()
        {
            if (Request.IsAjaxRequest())
            {
                return PartialView("ForgotPassword");
            }
            else
            {
                ViewBag.Action = "ForgotPassword";
                return View("Index", new UserCredential());
            }
        }

        [AllowAnonymous]
        [ActionName("forgot-password"), HttpPost]
        public ActionResult ForgotPassword(string value)
        {
            try
            {
                var result = UserBL.ForgotPassword(value);
                if (result == LoginResult.EmailSendingException)
                {
                    return Json(new { Result = LoginResult.EmailSendingException.ToString(), Message = "Unable to send an email. Please try again later. If the problem persists contact the System Administrator." });
                }
                else if (result == LoginResult.Invalid)
                {
                    return Json(new { Result = result, Message = "Email does not exist." });
                }
                return Json(new { Result = result.ToString() });
            }
            catch (Exception ex)
            {
                Log.Error("Error occured:", ex);
                return Json(new { Result = "ForgotPasswordException", Message = "The database is down, Please try again later. If the problem persists contact the System Administrator." });
            }
        }

        [AllowAnonymous]
        [ActionName("email-sent")]
        public ActionResult EmailSent()
        {
            if (Request.IsAjaxRequest())
            {
                return PartialView("EmailSent");
            }
            else
            {
                ViewBag.Action = "EmailSent";
                return View("Index", new UserCredential());
            }
        }

        //[ActionName("change-password")]
        //public ActionResult ChangePassword(string username)
        //{
        //    if (Request.IsAjaxRequest())
        //    {
        //        ViewBag.ChangePasswordUsername = username;
        //        return PartialView("ChangePassword");
        //    }
        //    else
        //    {
        //        ViewBag.ChangePasswordUsername = username;
        //        ViewBag.Action = "ChangePassword";
        //        return View("Index", new UserCredential());
        //    }
        //}

        [AllowAnonymous]
        [ActionName("change-password"), HttpPost]
        public ActionResult ChangePassword([System.Web.Http.FromUri]string value)
        {
            var rawValues = JsonConvert.DeserializeObject<Dictionary<string,string>>(value);
            string username = rawValues["username"];
            string currentPassword = rawValues["Password"];
            string newPassword = rawValues["password1"];
            var result = UserBL.ChangePassword(username, currentPassword, newPassword).ToString();
            return Json(new { Result = result });
        }
    }
}
