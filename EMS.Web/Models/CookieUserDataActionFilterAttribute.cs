using EMS.BusinessLogic.Security;
using EMS.Common;
using EMS.Model.Security;
using System;
using System.Web.Mvc;

namespace EMS.Web.Model
{
    public class CookieUserDataActionFilterAttribute : ActionFilterAttribute
    {
        private static readonly IAuthentication Authentication = EMSContainer.Resolve<IAuthentication>();

        public override void OnResultExecuting(ResultExecutingContext filterContext)
        {
            base.OnResultExecuting(filterContext);

            filterContext.Controller.ViewBag.GetUserData = new Func<CookieUserData>(() => Authentication.GetUserData());
        }
    }
}