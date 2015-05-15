using EMS.BusinessLogic.Security;
using EMS.Common;
using EMS.DataAccess;
using EMS.Web.App_Start;
using log4net;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity.Core;
using System.Data.SqlClient;
using System.Linq;
using System.Security.Principal;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace EMS.Web
{
    public class MvcApplication : System.Web.HttpApplication
    {

        private static IAuthentication _authentication;
        private static IRoleBL _roleBL;

        private static readonly ILog log = LogManager.GetLogger("LogCall");

        protected ILog Log
        {
            get
            {
                return log;
            }
        }

        protected MvcApplication()
        {
            EndRequest += MvcApplication_EndRequest;
            AuthenticateRequest += MvcApplicationAuthenticateRequest;
        }

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            DependencyConfig.RegisterDependencies();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            GlobalConfiguration.Configuration.Formatters.JsonFormatter.SerializerSettings.Re‌ferenceLoopHandling = ReferenceLoopHandling.Ignore;

            _authentication = EMSContainer.Resolve<IAuthentication>();
            _roleBL = EMSContainer.Resolve<IRoleBL>();
        }

        void MvcApplication_EndRequest(object sender, EventArgs e)
        {
            ContextLifetimeManager.Release();
        }

        void MvcApplicationAuthenticateRequest(object sender, EventArgs e)
        {
            try
            {
                var userData = _authentication.GetUserData();
                if (userData == null) return;

                var roles = _roleBL.GetRoleNamesForGroup(userData.GroupID);
                var userIdentity = new GenericIdentity(userData.Username);
                var userPrincipal = new GenericPrincipal(userIdentity, roles);
                Context.User = userPrincipal;
            }
            catch 
            {

            }
            
        }

        protected void Application_Error(object sender, EventArgs e)
        {
            Exception ex = Server.GetLastError();
            Log.Error("Error occured:", ex);

            if (ex is ProviderIncompatibleException)
            {
                Exception innerEx1 = ex.InnerException;
                if (innerEx1 is ProviderIncompatibleException)
                {
                    Exception innerEx2 = innerEx1.InnerException;
                    if (innerEx2 is SqlException)
                    {
                        Response.Write("Error in database.");
                    }
                }
            }
            else if (!(ex is HttpException))
            {
                var authentication = EMSContainer.Resolve<IAuthentication>();
                authentication.Logout();

                if (!((Context.Request["X-Requested-With"] == "XMLHttpRequest") || ((Context.Request.Headers != null) && (Context.Request.Headers["X-Requested-With"] == "XMLHttpRequest"))))
                {
                    Response.Redirect("~/login/error?code=1");
                }
            }
        }
    }
}
