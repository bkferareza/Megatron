using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;

namespace EMS.Web.Helpers
{
    public static class EntityHelper
    {
        public static TEntity ConvertObjectToEntity<TEntity>(object objectToConvert, TEntity entity) 
            where TEntity : class
        {
            if (objectToConvert == null || entity == null)
            {
                return null;
            }

            Type BusinessObjectType = entity.GetType();
            PropertyInfo[] BusinessPropList = BusinessObjectType.GetProperties();

            Type EntityObjectType = objectToConvert.GetType();
            PropertyInfo[] EntityPropList = EntityObjectType.GetProperties();

            foreach (PropertyInfo businessPropInfo in BusinessPropList)
            {
                foreach (PropertyInfo entityPropInfo in EntityPropList)
                {
                    if (entityPropInfo.Name == businessPropInfo.Name && !entityPropInfo.GetGetMethod().IsVirtual && !businessPropInfo.GetGetMethod().IsVirtual)
                    {
                        businessPropInfo.SetValue(entity, entityPropInfo.GetValue(objectToConvert, null), null);
                        break;
                    }
                }
            }

            return entity;
        }
    }
}