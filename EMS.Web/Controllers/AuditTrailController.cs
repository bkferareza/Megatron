using EMS.BusinessLogic.AuditTrail;
using EMS.BusinessLogic.AuditTrail.EntityTrailBL;
using EMS.Common;
using EMS.DataAccess;
using EMS.Model.Security;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace EMS.Web.Controllers
{
    [RoutePrefix("api/AuditTrail")]
    public class AuditTrailController : ApiController
    {
        // GET api/<controller>
        [Route("get")]
        public string Get()
        {
            var trails = new List<AuditTrail>();
            var context = EMSContainer.Resolve<IEMSContext>();

            trails = context.AuditTrails.Where((c) => true).ToList();


            return (trails != null) ? JsonConvert.SerializeObject(trails, Formatting.None,
                       new JsonSerializerSettings()
                       {
                           ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                       }) : null;
        }


    }
}