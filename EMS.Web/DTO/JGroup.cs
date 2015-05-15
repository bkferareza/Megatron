using EMS.Model;
using EMS.Model.DatapointManagement;
using EMS.Model.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EMS.Web.DTO
{
    [Serializable]
    public class JGroup
    {

        public JGroup()
        {
            Child = new List<JUser>();
        }

        public IList<JUser> Child { get; set; }

        public int GroupId { get; set; }
        
        public string Name { get; set; }
        
        public int? UserId { get; set; }




        public static JGroup MapEntity(Group group)
        {
            return new JGroup
            {
                GroupId = group.ID,
                Name = group.Name,
                UserId = group.UserID
            };
        }

    }
}