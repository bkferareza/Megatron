using EMS.BusinessLogic.DataPoint;
using EMS.BusinessLogic.Security;
using EMS.Common;
using EMS.Model.DatapointManagement;
using EMS.Model.Security;
using EMS.Web.DTO;
using EMS.Web.Model;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace EMS.Web.Controllers
{
    public class DataPointManagementController : Controller
    {
        //
        // GET: /DataPointManagement/

        private IAuthentication _authFactory;
        private static readonly IVariableTreeBL VariableTreeBL = EMSContainer.Resolve<IVariableTreeBL>();
        private static readonly ILogBL LogBL = EMSContainer.Resolve<ILogBL>();

        public DataPointManagementController()
        {
            _authFactory = EMSContainer.Resolve<IAuthentication>();

        }

        [AjaxAuthorize(Roles = Roles.FolderDatapointManagement.FoldersDatapoints.ModifyCreate)]
        public ActionResult Index()
        {
            return View();
        }

        [AjaxAuthorize(Roles = Roles.FolderDatapointManagement.FoldersDatapoints.ModifyCreate)]
        [HttpPost, ActionName("save-variable-tree")]
        [ValidateInput(false)]
        public ActionResult SaveVariableTree([System.Web.Http.FromUri]string value)
        {
            var variableTree = new JavaScriptSerializer().Deserialize<VariableTree>(value);
            var result = VariableTreeBL.SaveVariableTree(variableTree);
            return Json(result.ToJsonResult(result.Entity.ID));
        }

        [AjaxAuthorize(Roles = Roles.FolderDatapointManagement.FoldersDatapoints.ModifyCreate)]
        [HttpGet, ActionName("new-datapoint")]
        public string NewNode()
        {
            var variableTree = new VariableTree
            {
                ID = 0,
                ParentID = null
            };
            return new JavaScriptSerializer().Serialize(variableTree);
        }

        [AjaxAuthorize(Roles = Roles.FolderDatapointManagement.FoldersDatapoints.ModifyCreate)]
        [ActionName("variabletree")]
        [HttpGet]
        public string VariableTree(string value)
        {
            var variableTree = VariableTreeBL.GetFolderAndDatapointsOfUser(Convert.ToInt32(value), false);
            return new JavaScriptSerializer().Serialize(variableTree);
        }

        [AjaxAuthorize(Roles = Roles.FolderDatapointManagement.FoldersDatapoints.Delete)]
        [HttpPost, ActionName("delete-datapoint")]
        public ActionResult DeleteVariableTree(string value)
        {
            var id = Convert.ToInt32(value);
            var result = VariableTreeBL.CheckVariableTreeInUse(id);
            if (result)
            {
                return Json(new { Successful = false, Error = "Cannot delete datapoint. It is in use in Template."  });
            }
            
            VariableTreeBL.DeleteVariableTree(id);
            return Json(new { Successful = true });
        }

        [AjaxAuthorize(Roles = Roles.Tools.GenerateChartsandReports.ModifyCreate)]
        [ActionName("get-logs")]
        [HttpGet]
        public string GetLogs(string value)
        {
            return LogBL.GetLogs(Convert.ToInt32(value));

            //return new JavaScriptSerializer().Serialize(LogBL.GetLogs(Convert.ToInt32(value)));
        }

        [AjaxAuthorize(Roles = Roles.Tools.ImportDatapoint.Execute)]
        [ActionName("preview-import-datapoint")]
        [HttpPost]
        public ActionResult PreviewImportDatapoint()
        {
            if (Request.Files.Count > 0)
            {
                var postedFile = Request.Files[0];

                using (StreamReader sr = new StreamReader(postedFile.InputStream))
                {
                    var result = VariableTreeBL.PreviewImportDatapoint(postedFile.InputStream, postedFile.FileName);
                    return Json(result);
                }
            }

            return Json(new { Successful = false });
        }

        [AjaxAuthorize(Roles = Roles.Tools.ImportDatapoint.Execute)]
        [ActionName("import-datapoint")]
        [HttpPost]
        public ActionResult ImportDatapoint()
        {
            if (Request.Files.Count > 0)
            {
                var postedFile = Request.Files[0];

                using (StreamReader sr = new StreamReader(postedFile.InputStream))
                {
                    var result = VariableTreeBL.ImportDatapoint(postedFile.InputStream, postedFile.FileName);
                    return Json(new { Successful = result });
                }
            }

            return Json(new { Successful = false });
        }
    }
}