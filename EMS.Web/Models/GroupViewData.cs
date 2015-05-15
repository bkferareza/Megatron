using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using EMS.Model.Security;

namespace EMS.Web.Model
{
    public class GroupViewData
    {
        public Group Group
        {
            get;
            set;
        }

        public IList<RoleCategory> RoleCategories
        {
            get;
            set;
        }

        public bool IsNewGroup
        {
            get;
            set;
        }

        public bool CanDelete
        {
            get;
            set;
        }

        public bool CanModify
        {
            get;
            set;
        }

        public bool CanCreate
        {
            get;
            set;
        }

        public bool IsSystemAdminGroup
        {
            get;
            set;
        }

        public bool HasUsers
        {
            get;
            set;
        }

        public int UserID
        {
            get;
            set;
        }
    }
}