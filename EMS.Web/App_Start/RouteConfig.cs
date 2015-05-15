using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace EMS.Web
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );

            routes.MapRoute("GroupManagement", "{controller}/{action}/{id}/{userId}", new { controller = "UserManagement", action = "GroupDetails", type = UrlParameter.Optional, id = UrlParameter.Optional });
            routes.MapRoute("Dashboard", "dashboard", new { controller = "Dashboard", action = "Index" });
        }
    }
}
