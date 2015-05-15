using System.Collections.Generic;
using EMS.Model;
using EMS.Model.Security;
using EMS.Model.DatapointManagement;

namespace EMS.Web.Model
{
    public class UserViewData
    {
        public User User { get; set; }

        public bool IsCurrentUser { get; set; }

        public bool IsNewUser { get; set; }

        public bool CanDelete { get; set; }

        public bool CanModify { get; set; }

        public bool CanCreate { get; set; }

        public Group UserGroup { get; set; }

        public IList<Group> Groups { get; set; }

        public IList<KeyValuePair<UserStatus, string>> Statuses { get; set; }

        public UserFolderAccess UserFolderAccess { get; set; }
    }
}