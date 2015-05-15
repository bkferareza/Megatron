using EMS.BusinessLogic.DataPoint;
using EMS.BusinessLogic.GeneralConfiguration;
using EMS.BusinessLogic.Security;
using EMS.Common;
using EMS.Model;
using EMS.Model.DatapointManagement;
using EMS.Model.Security;
using EMS.Web.DTO;
using EMS.Web.Model;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace EMS.Web.Controllers
{
    [Authorize]
    public class UserManagementController : Controller
    {
        private static readonly IGroupBL GroupBL = EMSContainer.Resolve<IGroupBL>();
        private static readonly IUserBL UserBL = EMSContainer.Resolve<IUserBL>();
        private static readonly IRoleBL RoleBL = EMSContainer.Resolve<IRoleBL>();
        private static readonly IAuthentication Authentication = EMSContainer.Resolve<IAuthentication>();
        private static readonly IUserFolderAccessBL UserFolderAccessBL = EMSContainer.Resolve<IUserFolderAccessBL>();
        private static readonly IVariableTreeBL VariableTreeBL = EMSContainer.Resolve<IVariableTreeBL>();
        private static readonly IGeneralConfigurationBL GeneralConfigurationBL = EMSContainer.Resolve<IGeneralConfigurationBL>();

        [AjaxAuthorize(Roles = Roles.System.Users.ModifyCreate)]
        public ActionResult Index()
        {
            var groups = GroupBL.GetGroups();
            var data = new UserManagementViewData 
            { 
                Groups = groups,
                CanCreateGroup = Authentication.IsInRole(Roles.System.Groups.Create),
                CanCreateUser = Authentication.IsInRole(Roles.System.Users.Create)
            };

           // return View(data);
            return View("UserDetails");
        }

        [AjaxAuthorize(Roles = Roles.System.Users.ModifyCreate)]
        public ActionResult Users(short id)
        {
            return PartialView(UserBL.GetUsersForGroup(id));
        }

        [AjaxAuthorize(Roles = Roles.System.Users.ModifyCreate)]
        public ActionResult UserDetails(int id)
        {
            var user = id == 0 ? UserBL.CreateUser() : UserBL.GetUser(id);
            var groups = GroupBL.GetGroups();
            var userGroup = groups.FirstOrDefault(g => g.ID == user.GroupID) ?? groups[0];
            var userData = Authentication.GetUserData();

            return PartialView(new UserViewData {
                User = user,
                IsCurrentUser = userData.UserID == user.ID,
                IsNewUser = id == 0,
                CanDelete = Authentication.IsInRole(Roles.System.Users.Delete),
                CanModify = Authentication.IsInRole(Roles.System.Users.Modify),
                CanCreate = Authentication.IsInRole(Roles.System.Users.Create),
                UserGroup = userGroup,
                Groups = groups,
                Statuses = new List<KeyValuePair<UserStatus, string>> {
                    new KeyValuePair<UserStatus, string>(UserStatus.Active, "Active"),
                    new KeyValuePair<UserStatus, string>(UserStatus.Inactive, "Inactive")
                }
                //UserFolderAccess = SiteBL.GetSitesForUser(user.ID)
            });
        }


        [AjaxAuthorize(Roles = Roles.System.Users.ModifyCreate)]
        [HttpPost, ActionName("save-user")]
        [ValidateInput(false)]
        public ActionResult SaveUser([System.Web.Http.FromUri]string value)
        {
            var user = new JavaScriptSerializer().Deserialize<User>(value);
            var rawValues = JsonConvert.DeserializeObject<Dictionary<string, object>>(value);
            if(rawValues.ContainsKey("AccessType") && user.AccessType == 0)
            {
               
                    var userAccess = JsonConvert.DeserializeObject<Dictionary<string, string>>(rawValues["AccessType"].ToString());
                    if (userAccess["value"].Replace(" ", "") == AccessType.SuperAdministrator.ToString())
                        user.AccessType = AccessType.SuperAdministrator;
                    else if (userAccess["value"] == AccessType.Administrator.ToString())
                        user.AccessType = AccessType.Administrator;
                    else
                        user.AccessType = AccessType.User;
                
               
                
            }
            else if(user.AccessType != AccessType.SuperAdministrator && user.AccessType != AccessType.Administrator)
            {
                user.AccessType = AccessType.User;
            }

            if(rawValues.ContainsKey("Status"))
            {
                
                    var userStatus = JsonConvert.DeserializeObject<Dictionary<string, string>>(rawValues["Status"].ToString());
                    if (userStatus["value"] == UserStatus.Active.ToString())
                        user.Status = UserStatus.Active;
                    else
                        user.Status = UserStatus.Inactive;
               
               
               
            }
            if(rawValues.ContainsKey("NewUser") && rawValues["NewUser"].ToString() == false.ToString())
            {
                user.ID = UserBL.GetUserByUserName(user.Username).ID;
            }
            if(rawValues.ContainsKey("NoExpiration"))
            {
                user.Expiration = new DateTime(9999, 12, 31);
            }
       
            user.GivenName = user.GivenName.Trim();
            user.Surname = user.Surname.Trim();
            if (user.PhoneNumber != null)
            {
                user.PhoneNumber = user.PhoneNumber.Trim();
            }
            if (user.Miscellanous != null)
            {
                user.Miscellanous = user.Miscellanous.Trim();
            }

            // need to populate user object
            var userGroup = GroupBL.GetGroupAndRoles(user.GroupID);

            user.Group = userGroup;            

            if (user.Expiration <= DateTime.Today)
                user.Status = UserStatus.Inactive;

         
                var result = UserBL.SaveUser(user);
                return Json(result.ToJsonResult(result.Entity.ID));
            
        }

        [AjaxAuthorize(Roles = Roles.System.Users.ModifyCreate)]
        [HttpGet, ActionName("add-user")]
        public string AddUser()
        {
            var user = UserBL.CreateUser();
            return new JavaScriptSerializer().Serialize(user);
        }


        [AjaxAuthorize(Roles = Roles.System.Users.Delete)]
        [HttpPost, ActionName("delete-user")]
        public ActionResult DeleteUser(string value)
        {

            var userName = JsonConvert.DeserializeObject<string>(value);
            var user = UserBL.GetUserByUserName(userName);
            UserBL.DeleteUser(user.ID);
            return Json(new { Successful = true });
        }


        [AjaxAuthorize(Roles = Roles.System.Users.ModifyCreate)]
        [HttpPost, ActionName("reset-password")]
        public ActionResult ResetPassword(string value)
        {
            var userName = JsonConvert.DeserializeObject<string>(value);
            var user = UserBL.GetUserByUserName(userName);
            UserBL.ResetPassword(user.ID);
            return Json(new { Successful = true });
        }


        [AjaxAuthorize(Roles = Roles.System.Users.ModifyCreate)]
        [HttpPost, ActionName("username-exist")]
        public ActionResult UsernameExists([System.Web.Http.FromUri]string value)
        {
            var user = new JavaScriptSerializer().Deserialize<User>(value);
            return new JsonResult
            {
                Data = !UserBL.UsernameExists(user.ID, user.Username)
            };
        }


        [AjaxAuthorize(Roles = Roles.System.Users.ModifyCreate)]
        [HttpPost, ActionName("email-exist")]
        public ActionResult EmailExists([System.Web.Http.FromUri]string value)
        {
            var user = new JavaScriptSerializer().Deserialize<User>(value);
            return new JsonResult
            {
                Data = !UserBL.EmailExists(user.ID, user.EmailAddress)
            };
        }

        [AjaxAuthorize(Roles = Roles.System.Groups.ModifyCreate)]
        [HttpGet, ActionName("groupInfo")]
        public string GroupDetails(string value)
        {
            var groupInfo = new JavaScriptSerializer().Deserialize<Dictionary<string, string>>(value);
            var groupId = Convert.ToInt16(groupInfo["GroupId"]);

            var group = groupId <= 0 ? GroupBL.CreateGroup() : GroupBL.GetGroupAndRoles(groupId);

            return new JavaScriptSerializer().Serialize(group);
        }

        [AjaxAuthorize(Roles = Roles.System.Groups.ModifyCreate)]
        public ActionResult GroupDetails(int id, int userId)
        {
            var group = id <= 0 ? GroupBL.CreateGroup() : GroupBL.GetGroupAndRoles(id);

            return PartialView(new GroupViewData
            {
                Group = group,
                IsNewGroup = id <= 0,
                RoleCategories = RoleBL.GetRoleCategoriesWithRoles(),
                CanDelete = (id > 0 && Authentication.IsInRole(Roles.System.Groups.Delete)),
                CanModify = Authentication.IsInRole(Roles.System.Groups.Modify),
                IsSystemAdminGroup = group.ID == 1,
                HasUsers = GroupBL.GroupHasUsers(id),
                UserID = userId
            });
        }

        [AjaxAuthorize(Roles = Roles.System.Groups.ModifyCreate)]
        [HttpPost, ActionName("save-group")]
        [ValidateInput(false)]
        public ActionResult SaveGroup(Group group)
        {
            var result = GroupBL.SaveGroupAndRoles(group);

            if (!result.Successful)
            {
                return Json(result.ToJsonResult());
            }

            return Json(result.ToJsonResult(result.Entity.ID));
        }

        [AjaxAuthorize(Roles = Roles.System.Groups.Delete)]
        [HttpPost, ActionName("delete-group")]
        public ActionResult DeleteGroup(short groupID)
        {
            GroupBL.DeleteGroup(groupID);
            return Json(new { Successful = true });
        }


        [AjaxAuthorize(Roles = Roles.System.Users.ModifyCreate)]
        [ActionName("user-tree")]
        [HttpGet]
        public string UserTree(string value)
        {
            //return PartialView("UserTree", new UserManagementViewData { Groups = GroupBL.GetGroups() });
            var user = UserBL.GetUserByUserName(new JavaScriptSerializer().Deserialize <string>(value));
            var jUser = JUser.MapEntity(user);
            jUser = LoadGroup(jUser);

            return new JavaScriptSerializer().Serialize(jUser);
        }

        private JGroup LoadUsers(JGroup group)
        {
            var users = UserBL.GetUsersForGroup(group.GroupId).OrderBy(u => u.AccessType);

            foreach (User user in users)
            {
                var juser = JUser.MapEntity(user);
                juser = LoadGroup(juser);
                group.Child.Add(juser);
            }

            return group;
        }

        private JUser LoadGroup(JUser jUser)
        {
            var groups = GroupBL.GetGroupsOfUser(jUser.UserId);

            foreach (Group group in groups)
            {
                var jgroup = JGroup.MapEntity(group);
                jgroup = LoadUsers(jgroup);
                jUser.Child.Add(jgroup);
            }

            return jUser;
        }

        [AjaxAuthorize(Roles = Roles.System.Users.ModifyCreate)]
        [ActionName("user-manage")]
        public ActionResult UserManage()
        {
           
            return View();
        }

        [AjaxAuthorize(Roles = Roles.System.Users.ModifyCreate)]
        [HttpGet, ActionName("userInfo")]
        public string GetUserInfo(string value)
        {
            var credentials = JsonConvert.DeserializeObject<Dictionary<string, object>>(value);
            var userName = credentials["Username"].ToString();

            return new JavaScriptSerializer().Serialize(UserBL.GetUserByUserName(userName));
        }

        [AjaxAuthorize(Roles = Roles.System.Users.ModifyCreate)]
        [HttpGet, ActionName("groupsOfUser")]
        public string GetGroupsOfUser(string value)
        {
            return new JavaScriptSerializer().Serialize(GroupBL.GetGroupsOfUser(Convert.ToInt32(value)));
        }

        [AjaxAuthorize(Roles = Roles.System.Users.ModifyCreate)]
        [ActionName("variabletree-with-access")]
        [HttpGet]
        public string VariableTreeWithUserFolderAccess(string value)
        {
            var variableTree = VariableTreeBL.GetFolderOfUserWithAccess(Convert.ToInt32(value));
            return new JavaScriptSerializer().Serialize(variableTree);
        }

        [ActionName("general-configuration")]
        [HttpGet]
        public ActionResult GetGeneralConfiguration()
        {
            var generalConfiguration = GeneralConfigurationBL.GetConfigurations();
            return Json(new { Successful = true, Entity = generalConfiguration }, JsonRequestBehavior.AllowGet);
        }

        [ActionName("save-general-configuration")]
        [HttpPost]
        [ValidateInput(false)]
        public ActionResult SaveGeneralConfiguration(string value)
        {
            var generalConfiguration = new JavaScriptSerializer().Deserialize<EMS.Model.GeneralConfiguration.GeneralConfiguration>(value);
            var result = GeneralConfigurationBL.SaveConfigurations(generalConfiguration);
            return Json(result);
        }

        [ActionName("get-permissions")]
        [HttpGet]
        public string GetPermissions()
        {
            var permission = UserBL.GetPermissions();
            return new JavaScriptSerializer().Serialize(permission);
        }

    }
}
