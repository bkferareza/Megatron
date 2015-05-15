using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using EMS.Model.Security;

namespace EMS.Web.Model
{
    public class UserManagementViewData
    {
        public IList<Group> Groups
        {
            get;
            set;
        }

        public bool CanCreateGroup
        {
            get;
            set;
        }

        public bool CanCreateUser
        {
            get;
            set;
        }
    }
}
