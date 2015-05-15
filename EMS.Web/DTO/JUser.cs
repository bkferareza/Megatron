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
    public class JUser
    {

        public JUser()
        {
            Child = new List<JGroup>();
        }

        public IList<JGroup> Child { get; set; }

        public int UserId { get; set; }

        public string Username
        {
            get;
            set;
        }

        public string GivenName
        {
            get;
            set;
        }

        public string Surname
        {
            get;
            set;
        }

        public string Name
        {
            get
            {
                return string.Format("{0} {1}", GivenName, Surname);
            }
        }

        public string EmailAddress
        {
            get;
            set;
        }

        public string PhoneNumber
        {
            get;
            set;
        }

        public string Miscellanous
        {
            get;
            set;
        }

        public UserStatus Status
        {
            get;
            set;
        }

        public UserSetttings Settings
        {
            get;
            set;
        }

        public int ParentID
        {
            get;
            set;
        }

        public int GroupID
        {
            get;
            set;
        }

        public byte Attempts
        {
            get;
            set;
        }

        public DateTime? Expiration
        {
            get;
            set;
        }

        public AccessType AccessType
        {
            get;
            set;
        }

        public string BackgroundImage
        {
            get;
            set;
        }

        public string Logo
        {
            get;
            set;
        }

        public BackgroundImageStyle BackgroundImageStyle { get; set; }

        public IList<VariableTree> Folders { get; set; }


        public static JUser MapEntity(User user)
        {
            return new JUser
            {
                UserId = user.ID,
                Username = user.Username,
                GivenName = user.GivenName,
                Surname = user.Surname,
                EmailAddress = user.EmailAddress,
                PhoneNumber = user.PhoneNumber,
                Miscellanous = user.Miscellanous,
                Status = user.Status,
                Settings = user.Settings,
                ParentID = user.ParentID,
                GroupID = user.GroupID,
                Attempts = user.Attempts,
                Expiration = user.Expiration,
                AccessType = user.AccessType,
                BackgroundImage = user.BackgroundImage,
                BackgroundImageStyle = user.BackgroundImageStyle,
                Logo = user.Logo
            };
        }

    }
}