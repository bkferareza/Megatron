using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(EMS.Web.Startup))]
namespace EMS.Web
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
