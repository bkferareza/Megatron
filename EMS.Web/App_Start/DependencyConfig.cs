using EMS.BusinessLogic.DataPoint;
using EMS.BusinessLogic.GeneralConfiguration;
using EMS.BusinessLogic.Security;
using EMS.Common;
using EMS.DataAccess;
using Microsoft.Practices.Unity;
using Microsoft.Practices.Unity.InterceptionExtension;

namespace EMS.Web
{
    public static class DependencyConfig
    {
        public static void RegisterDependencies()
        {
            EMSContainer.RegisterType<IEMSContext, EMSContext>(new ContextLifetimeManager());
            EMSContainer.RegisterType<IEMSContext, EMSContext>("New");
            EMSContainer.RegisterInstance<IUserBL>(new UserBL());
            EMSContainer.RegisterInstance<IAuthentication>(new WebAuthentication());
            EMSContainer.RegisterInstance<IGroupBL>(new GroupBL());
            EMSContainer.RegisterInstance<IRoleBL>(new RoleBL());
            EMSContainer.RegisterInstance<IDataCommands>(new DataCommands());
            EMSContainer.RegisterInstance<ITemplateBL>(new TemplateBL());
            EMSContainer.RegisterInstance<IVariableTreeBL>(new VariableTreeBL());
            EMSContainer.RegisterInstance<IUserFolderAccessBL>(new UserFolderAccessBL());
            EMSContainer.RegisterInstance<ILogBL>(new LogBL());
            EMSContainer.RegisterInstance<IGeneralConfigurationBL>(new GeneralConfigurationBL());
            EMSContainer.RegisterInstance<IDiscussionMessageBL>(new DiscussionMessageBL());
            EMSContainer.RegisterInstance<IDiscussionsBL>(new DiscussionsBL());
            EMSContainer.RegisterInstance<IChartDatapointBL>(new ChartDataPointBL());
            EMSContainer.RegisterInstance<IChartsBL>(new ChartsBL());
            EMSContainer.RegisterInstance<IUserChartBL>(new UserChartBL());
            EMSContainer.RegisterInstance<IUserChartDataPointBL>(new UserChartDataPointBL());
            EMSContainer.RegisterInstance<IUserTemplateBL>(new UserTemplateBL());


            EMSContainer.Instance
                             .Configure<Interception>()
                             .SetInterceptorFor<IUserBL>(new InterfaceInterceptor())
                             .SetInterceptorFor<IAuthentication>(new InterfaceInterceptor())
                             .SetInterceptorFor<IGroupBL>(new InterfaceInterceptor())
                             .SetInterceptorFor<IRoleBL>(new InterfaceInterceptor())
                             .SetInterceptorFor<IDataCommands>(new InterfaceInterceptor())
                             .SetInterceptorFor<IVariableTreeBL>(new InterfaceInterceptor())
                             .SetInterceptorFor<IUserFolderAccessBL>(new InterfaceInterceptor())
                             .SetInterceptorFor<ILogBL>(new InterfaceInterceptor())
                             .SetInterceptorFor<IGeneralConfigurationBL>(new InterfaceInterceptor())
                             .SetDefaultInterceptorFor<ITemplateBL>(new InterfaceInterceptor())
                             .SetDefaultInterceptorFor<IDiscussionMessageBL>(new InterfaceInterceptor())
                             .SetDefaultInterceptorFor<IDiscussionsBL>(new InterfaceInterceptor())
                             .SetDefaultInterceptorFor<IChartDatapointBL>(new InterfaceInterceptor())
                             .SetDefaultInterceptorFor<IChartsBL>(new InterfaceInterceptor())
                             .SetDefaultInterceptorFor<IUserChartDataPointBL>(new InterfaceInterceptor())
                             .SetDefaultInterceptorFor<IUserChartBL>(new InterfaceInterceptor())
                             ;
        }
    }
}
