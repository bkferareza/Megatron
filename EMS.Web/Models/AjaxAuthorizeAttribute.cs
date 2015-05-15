using System.Web;
using System.Web.Mvc;

namespace EMS.Web.Model
{
    public class AjaxAuthorizeAttribute : AuthorizeAttribute
    {
        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            if (filterContext.HttpContext.Request.IsAjaxRequest())
            {
                throw new HttpException(511, "AjaxUnauthorisedError");
            }

            base.HandleUnauthorizedRequest(filterContext);
        }
    }
}