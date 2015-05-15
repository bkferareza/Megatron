using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EMS.Web.DTO
{
    public class JTemplate
    {
        public string Name { get; set; }
        public int UserID { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime? DateModified { get; set; }
        public bool ShowInDashboard { get; set; }

    }
}