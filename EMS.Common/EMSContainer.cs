using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Practices.Unity;
using Microsoft.Practices.Unity.Configuration;
using Microsoft.Practices.Unity.InterceptionExtension;

namespace EMS.Common
{
    public class EMSContainer
    {
        private static UnityContainer _instance;

        static EMSContainer()
        {
            _instance = new UnityContainer();
            _instance.AddNewExtension<Interception>();

            var section = (UnityConfigurationSection)ConfigurationManager.GetSection("unity");

            if (section != null)
            {
                section.Configure(_instance);
            }
        }

        public static UnityContainer Instance
        {
            get
            {
                return _instance;
            }
        }

        public static void RegisterInstance<T>(T instance)
        {
            Instance.RegisterInstance<T>(instance);
        }

        public static void RegisterType<TFrom, TTo>()
            where TTo : TFrom
        {
            Instance.RegisterType<TFrom, TTo>();
        }

        public static void RegisterType<TFrom, TTo>(string name)
            where TTo : TFrom
        {
            Instance.RegisterType<TFrom, TTo>(name);
        }

        public static void RegisterType<TFrom, TTo>(LifetimeManager lifetimeManager)
            where TTo : TFrom
        {
            Instance.RegisterType<TFrom, TTo>(lifetimeManager);
        }

        public static T Resolve<T>()
        {
            return Instance.Resolve<T>();
        }

        public static T Resolve<T>(string name)
        {
            return Instance.Resolve<T>(name);
        }

        public static void Teardown(object o)
        {
            Instance.Teardown(o);
        }
    }
}
