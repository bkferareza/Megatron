usersModule.controller('loginController',
    function ($scope, toastr, $location,
        CurrentUser, usersFactory, CurrentRole,
        Expiration, miscService, $route, Permissions)
    {
        $scope.hasLogo = false;

        $scope.logoUrl = "/api/misc/getdefaultlogo?stamp=" + Date.now().toString();
        miscService.hasDefaultLogo().then(function (data) { $scope.hasLogo = data; });
        miscService.loadDefaultTheme();

        $scope.page.setTitle('EMS Login Page');
        $scope.showModal = false;
        $scope.account = {};
        $scope.logging = false;
        $scope.showFirstTime = false;
        $scope.mainLogin = true;
        $scope.$Permissions = Permissions;
        $scope.toggleModal = function()
        {
            $scope.showModal = !$scope.showModal;
            $scope.mainLogin = !$scope.mainLogin;
            $scope.account.Email = '';
        }

        $scope.toggleFirstTime = function()
        {
            $scope.showFirstTime = !$scope.showFirstTime;
            $scope.mainLogin = !$scope.mainLogin;
         
        }

        $scope.forgetPassword = function(email)
        {
            if(validate(email))
            {
                $scope.logging = true;
                $scope.account.Email = '';

                usersFactory.forgotPassword(email)
                    .then(function (result) {

                        if (result.Result == 'Successful') {
                            toastr.success("Password was sent to email");
                            $scope.toggleModal();
                        }
                        else {
                            toastr.error(result.Message);
                        }

                        $scope.logging = false;
                    });
            }
            else {
                toastr.error("Email address does not exist");
            }
        }

        $scope.login_ = function(account)
        {
            //temporaryData
            $scope.logging = true;
            if(validateUser(account.Username) && validateUser(account.Password))
            {
                usersFactory.login(account)
                .then(function (result) {
                    if (result.Result == 'Successful')
                    {
                        $scope.$Permissions.getPermissions();
                        CurrentUser.setUser(account.Username);
                        usersFactory.getUserInfo(account)
                             .then(function (result) {
                                 var info = result;
                                 var date = new Date(2015, 9, 8);
                                 if (info.Expiration != null || info.Expiration != undefined)
                                 {
                                     var rawDate = info.Expiration;
                                     date = new Date(parseInt(rawDate.substr(6)));

                                 }
                                 if (info.DateCreated != null || info.DateCreated != undefined)
                                 {
                                     var rawDate = info.DateCreated;
                                     info.DateCreated = new Date(parseInt(rawDate.substr(6)));
                                 }
                                 Expiration.setExpiry(date);
                                 CurrentUser.setUserInfo(info);
                                 //console.log(result);
                                 var url = '/dashboard';
                                 $location.path(url);
                                 toastr.success("Login Success!");

                                 var user = CurrentUser.getUserInfo();
                                 CurrentRole.setUser(user.AccessType);

                                 usersFactory.getGroupsOfUser(user.ID)
                                   .then(function (result) {
                                       var info = result;
                                       CurrentUser.setGroupsOfUser(info);
                                   });

                             });    
                        
                    }
                    else if(result.Result == 'ChangePassword')
                    {

                        $scope.toggleFirstTime();
                        $scope.logging = false;
                    }
                else
                    {
                        $scope.account = {};
                        toastr.error(result.Message);
                        $scope.logging = false;
                }
                });
            }
            else if(account.Username == '' || account.Password == '')
            {
                $scope.account = {};
                toastr.error("Login Failed! Username or Password should not be empty");
                $scope.logging = false;
            }
            else
            {
                $scope.account = {};
                toastr.error("Login Failed! Username and Password should be atleast 5 characters long");
                $scope.logging = false;
            }
            
        }

        function validate(data) {
            var pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (pattern.test(data)) {
                return true;
            } else {
                return false;
            }
        }

        function validateUser(data) {
            var pattern = /^[a-zA-Z0-9_-]{5,50}$/;
            if (pattern.test(data)) {
                return true;
            } else {
                return false;
            }
        }

        function validatePassword(data)
        {
            var pattern = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{5,50}$/;
            if (pattern.test(data)) {
                return true;
            } else {
                return false;
            }
        }

        $scope.ChangePassword = function(password1,password2,username,oldPassword)
        {
            $scope.account = {};
            if (validatePassword(password1) && validatePassword(password2))
            {

                if(password1 == password2)
                {
                    $scope.logging = true;
                    $scope.account.password1 = password1;
                    $scope.account.username = username;
                    $scope.account.Password = oldPassword;
                    usersFactory.changePassword($scope.account)
                    .then(function (result)
                    {
                        var url = '/';
                        $location.path(url);
                        $route.reload();
                        toastr.success("Password Change Success");
                        $scope.logging = false;

                    });
                    
                }
                else
                {

                    toastr.error("Passwords do not match!");
                    $scope.logging = false;
                }

            }
            else
            {
                toastr.error("One or both of the password is invalid. Minimum of 5 characters\n Must contain atleast 1 uppercase, 1 lowercase and 1 number");
                $scope.logging = false;
            }
        }

    });


usersModule.controller('usersController',
    function ($scope, toastr, $location,
        CurrentUser, $timeout, keys,
        $upload, usersFactory, $filter,
        CurrentRole, Expiration, Logout, $route, miscService, auditTrailFactory,
        GeneralConfiguration, Permissions) {


        $scope.selectedUser = false;
        $scope.hasLogo = false;
        $scope.logoUrl = "/api/misc/getlogo?stamp=" + Date.now().toString();
        miscService.hasLogo().then(function (data) { $scope.hasLogo = data; });
        miscService.loadTheme();
        $scope.loggedUser = CurrentUser.getUserInfo();
        $scope.loggedUser.UserId = $scope.loggedUser.ID;

        $scope.user = CurrentUser.getUserInfo();
        $scope.user.UserId = $scope.user.ID;

        usersFactory.getGroupsOfUser($scope.loggedUser.ID)
            .then(function (result) {
                var info = result;
                CurrentUser.setGroupsOfUser(info);
            });

        var vm = this;
        $scope.page.setTitle('EMS User Management Page');
        
        $scope.currentUser = CurrentUser.getUser();
        $scope.currentRole = CurrentRole.getUser();
        $scope.groups = CurrentUser.getGroupsOfUser();
        $scope.$GeneralConfiguration = GeneralConfiguration;
        $scope.$Permissions = Permissions;
        $scope.roles = getRoles();
        $scope.status = getStatus();
        $scope.showAdmin = true;
        $scope.variableTree = [];
        $scope.variableTreeIDs = [];
        $scope.activeDelete = false;
        $scope.activeEdit = false;
        $scope.activeUsername = false;
        $scope.activeEmail = false;
        $scope.hideManage = CurrentRole.IsAdmin();

        if ($scope.$Permissions.permissions().CanModifyUsers && $scope.$Permissions.permissions().CanModifyTemplates && $scope.$Permissions.permissions().CanCreateFoldersDatapoints) {
            $scope.hideManage = true;
        }
        else {
            $scope.hideManage = false;
        }

        $scope.loggedUser.Expiration = Expiration.getExpiry();
        $scope.user.Expiration = Expiration.getExpiry();
        $scope.Expiration = Expiration.getExpiryInMS();
        $scope.panel = false;
        $scope.list = [];
        $scope.newUser = false;
        $scope.isSuperAdmin = false;
        $scope.noExpiration = $scope.panel;
        $scope.loading = true;
        $scope.rightPanelEnabled = false;
        $scope.accessType = false;
        $scope.activeStatus = true;
        $scope.loggedUser.Status = $scope.status[$scope.loggedUser.Status - 1];
        $scope.loggedUser.Group = findGroup($scope.loggedUser.GroupID);
        $scope.user.Status = $scope.status[$scope.loggedUser.Status - 1];
        $scope.user.Group = findGroup($scope.loggedUser.GroupID);
        $scope.backgroundImageFileName = $scope.user.BackgroundImage;
        $scope.logoFileName = $scope.user.Logo;

        usersFactory.getUserTree($scope.loggedUser.Username)
        .then(function (result) {
            var data = [];
            data.push(result);
            $scope.list = data;
            $scope.newUser = false;
            $scope.panel = true;
            $scope.activeDelete = true;
            $scope.activeEdit = true;
            $scope.activeUsername = false;
            $scope.activeEmail = false;
            if (( $scope.currentRole == 1) || ( $scope.currentRole == 2))
            {
                $scope.isSuperAdmin = true;
            }
            //console.log($scope.list);
            $scope.loading = false;

            var height = $(window).height() - 110;
            $('#left-panel').height(height);

            setTimeout(adjustTreeNodes, 1);

        });

        usersFactory.getVariableTree($scope.loggedUser.UserId)
                .then(function (result) {
                    var data = [];
                    data.push(result);
                    $scope.variableTree = data;

                    var height = $(window).height() - 150;
                    $('#right-panel').height(height);

                    setTimeout(adjustTreeNodes, 1);
                });

        $scope.parameters = {
            dragEnabled: false,
            emptyPlaceholderEnabled: true,
            maxDepth: 10,
            dragDelay: 0,
            dragDistance: 0,
            lockX: false,
            lockY: false,
            boundTo: '',
            spacing: 20,
            coverage: 50,
            //cancelKey: 'esc',
            //copyKey: 'shift',
            //selectKey: 'ctrl',
            enableExpandOnHover: true,
            expandOnHover: 500,
        };



        $scope.keys = keys;

        $scope.NoExpiration = function()
        {
            $scope.noExpiration = !$scope.noExpiration;
        }

        $scope.logOut = function () {
            Logout.logOut();
            var url = '/';
            $location.path(url);
            $route.reload();
        }

        $scope.addUser = function () {
            $scope.newUser = true;
            $scope.roles = getRoles();

            usersFactory.getGroupsOfUser($scope.loggedUser.UserId)
            .then(function (result) {
                var info = result;

                CurrentUser.setGroupsOfUser(info);
                $scope.groups = CurrentUser.getGroupsOfUser();

            });

            usersFactory.addNewUser()
            .then(function (result) {
                //console.log(result);
                ResetNoExpiry();
                $scope.accessType = true;
                $scope.activeStatus = false;
                $scope.user = result;
                $scope.user.DateCreated = new Date();
                $scope.user.Expiration = new Date(defaultExpiry());
                $scope.user.Status = $scope.status[0];
                $scope.user.AccessType = $scope.roles[0];
                $scope.UserInfo.$setPristine();
                $scope.enableUserAdd();
                $scope.BackgroundImage = undefined;
                $scope.backgroundImageFile = undefined;
                $scope.backgroundImageFileName = "";
                $scope.Logo = undefined;
                $scope.logoFile = undefined;
                $scope.logoFileName = "";
                $scope.rightPanelEnabled = true;

            });

            usersFactory.getVariableTree(0)
            .then(function (result) {
                var data = [];
                data.push(result);
                $scope.variableTree = data;

                var height = $(window).height() - 150;
                $('#right-panel').height(height);

                setTimeout(adjustTreeNodes, 1);
            });
        }

        $scope.deleteUser = function (user)
        {
            
            usersFactory.deleteUser(user.Username)
            .then(function (result) {
                if(result.Successful)
                {
                    toastr.success('User was deleted successfully');
                    $scope.reloadPage();
                }
                else
                {
                    toast.error('User cannot be deleted');
                }
            });
        }

        $scope.deleteGroup = function (groupId) {
            deleteGroup(groupId);
        }

        $scope.resetPassword = function (user)
        {
            usersFactory.resetPassword(user.Username)
            .then(function (result) {
                if (result.Successful) {
                    toastr.success('User password changed successfully');
                    $scope.reloadPage();
                }
                else
                    toastr.error('Cannot Reset password');
            }); 
        }

        $scope.saveChanges = function (user)
        {
            delete user.Child;
            $scope.loading = true;
            $scope.Message = "Saving...";

            if ($scope.user.Group != null)
                user.GroupID = $scope.user.Group.ID;

            var valid = Validate(user);
         
            var uploadBackgroundImage = false;
            var uploadLogo = false;

            if ((user.BackgroundImage != $scope.backgroundImageFileName) && ($scope.backgroundImageFile != undefined)) {
                if ($scope.backgroundImageFileName != "") {
                    uploadBackgroundImage = true;
                }
            }

            if ((user.Logo != $scope.logoFileName) && ($scope.logoFile != undefined)) {
                if ($scope.logoFileName != "") {
                    uploadLogo = true;
                }
            }

            user.BackgroundImage = $scope.backgroundImageFileName;
            user.Logo = $scope.logoFileName;

         
            if (valid && $scope.newUser) {
                var parent= CurrentUser.getUserInfo();
                user.ParentID = parent.ID;
                user.NewUser = true;               

                usersFactory.usernameCheck(user)
                .then(function (result) {
                    if (result) {

                        usersFactory.emailCheck(user)
                        .then(function (result) {
                            if (result) {
                                $scope.variableTreeIDs = [];
                                GetUserFolderAccess();
                                user.UserFolderAccess = $scope.variableTreeIDs;
                                usersFactory.saveChanges(user)
                                .then(function (result) {
                                    //console.log(result);
                                    if (result.Successful)
                                    {
                                        usersFactory.getUserInfo(user)
                                             .then(function (result) {
                                                id = result.ID;
                                                if (uploadBackgroundImage) {
                                                    $scope.uploadBackground($scope.backgroundImageFile, id);

                                                 }
                                                 if (uploadLogo) {
                                                     $scope.uploadLogo($scope.logoFile, id);
                                                 }


                                                 $scope.reloadPage();
                                                 toastr.success('Save successfully');
                                                 $scope.loading = false;
                                             });

                                    }
                                    
                                       
                                    else
                                    {
                                        toastr.error('Error saving!');
                                        $scope.loading = false;

 
                                    }
                                        
                                });
                               }
                            else
                            {
                                toastr.error('Email exists');
                                $scope.loading = false;


                            }
                                
                        });

                    }
                    else
                    {
                        toastr.error('Username exists');
                        $scope.loading = false;


                    }
                       
                });
            }
            else if (valid)
            {
                user.NewUser = false;
                $scope.variableTreeIDs = [];
                GetUserFolderAccess();
                user.UserFolderAccess = $scope.variableTreeIDs;
                        usersFactory.saveChanges(user)
                                .then(function (result) {
                                    //console.log(result);
                                    if (result.Successful) {

                                        if (uploadBackgroundImage) {
                                            $scope.uploadBackground($scope.backgroundImageFile, user.UserId);

                                        }
                                        if (uploadLogo) {
                                            $scope.uploadLogo($scope.logoFile, user.UserId);
                                        }

                                        $scope.reloadPage();
                                        toastr.success('Save successfully');
                                        $scope.loading = false;

                                    }


                                    else
                                    {
                                        toastr.error('Error saving!');
                                        $scope.loading = false;

                                    }
                                        

                                });
            }
        }

        $scope.callbacks = {
        };

        $scope.remove = function (scope) {
            scope.remove();
        };

        $scope.toggle = function (scope) {
            scope.toggle();
        };

        $scope.newSubItem = function (scope) {
            var nodeData = scope.$modelValue;
            nodeData.items.push({
                id: nodeData.id * 10 + nodeData.items.length,
                title: nodeData.title + '.' + (nodeData.items.length + 1),
                items: []
            });
        };

        $scope.showToggle = function(scope)
        {
            var data = scope.$modelValue;
            if (data == undefined)
            {
                return null;
            }
            //console.log(data);
            if(data.Child.length < 1)
            {
                return false;
            }
           
            return true;
        }

        $scope.showToggleUserFolderAccess = function (items) {
            var variableTree = items.$modelValue;

            if (variableTree.ChildVariables != null) {
                return variableTree.ChildVariables.length > 0;
            }

            return false;
        }

        $scope.cascadeCheck = function (variableTreeItem) {
            var variableTree = variableTreeItem.$modelValue;

            if (variableTree.UserHasAccess) {
                checkParent(variableTreeItem);
            }
            else
            {
                unCheckChildren(variableTree);
            }
        }

        function unCheckChildren(variableTree)
        {
            variableTree.UserHasAccess = false;

            if ((variableTree.ChildVariables != null) && (variableTree.ChildVariables != undefined))
            {
                for (var i = 0; i < variableTree.ChildVariables.length; i++) {
                    unCheckChildren(variableTree.ChildVariables[i]);
                }
            }
        }

        function checkParent(variableTreeItem) {

            variableTreeItem.$modelValue.UserHasAccess = true;

            if ((variableTreeItem.$parent.$parent != null) && (variableTreeItem.$parent.$parent != undefined)) {
                checkParent(variableTreeItem.$parent.$parent);
            }
        }

        $scope.showAccess = function (scope) {
            var data = scope.$modelValue;
            if (data == undefined) {
                return null;
            }
            if (data.type == 'datapoint') {
                return false;
            }

            return true;
        }

        $scope.modify = function(scope)
        {
            var data = scope.$modelValue;
            if (data == undefined) {
                return null;
            }

            if (data.Username == null) {
                loadGroup(data.GroupId, data.UserId);
            }
            else {

                $scope.loadPage();

                $scope.user = angular.copy(data);

                $scope.selectedUser = true;

                if ($scope.user.ParentID > 0) {
                    usersFactory.getGroupsOfUser($scope.user.ParentID)
                    .then(function (result) {
                        var info = result;
                        CurrentUser.setGroupsOfUser(info);
                        $scope.groups = CurrentUser.getGroupsOfUser();
                        $scope.user.Group = findGroup($scope.user.GroupID);
                    });
                }

                $scope.roles = getRoles();
                if ($scope.user.Username == $scope.currentUser) {
                    $scope.newUser = false;
                    $scope.noExpiration = false;
                    $scope.panel = false;
                    $scope.activeDelete = true;
                    $scope.activeEdit = true;
                    $scope.activeUsername = false;
                    $scope.activeEmail = false;
                    $scope.accessType = false;
                    $scope.activeStatus = true;
                }
                else {
                    $scope.newUser = false;
                    $scope.panel = false;
                    $scope.noExpiration = false;
                    $scope.activeEdit = false;
                    $scope.activeUsername = false;
                    $scope.activeEmail = false;
                    $scope.accessType = true;
                    $scope.activeStatus = false;

                    if ($scope.user.Child.length > 0) {
                        $scope.activeDelete = true;
                    }
                    else
                    {
                        $scope.activeDelete = false;
                    }
                }

                usersFactory.getVariableTree($scope.user.UserId)
                .then(function (result) {
                    var data = [];
                    data.push(result);
                    $scope.variableTree = data;

                    var height = $(window).height() - 150;
                    $('#right-panel').height(height);

                    setTimeout(adjustTreeNodes, 1);
                });

                if ($scope.user.UserId == $scope.loggedUser.UserId)
                {
                    $scope.rightPanelEnabled = false;
                }
                else
                {
                    $scope.rightPanelEnabled = true;
                }

                //check if date is parseable
                if (!isNaN(Date.parse($scope.user.Expiration)) && $scope.user.Expiration != null)
                    $scope.user.Expiration = parseDate($scope.user.Expiration);

                $scope.user.AccessType = findRole($scope.user.AccessType);
                $scope.user.Status = $scope.status[$scope.user.Status - 1];
                //$scope.user.Expiration = Expiration.getExpiry();
                $scope.Expiration = Expiration.getExpiryInMS();

                var expiration = $scope.user.Expiration;
                ResetNoExpiry();
                if (expiration.getFullYear() > 2115 && expiration != undefined) {
                    $scope.NoExpiration();
                    TickNoExpiry();
                }

                $scope.backgroundImageFileName = $scope.user.BackgroundImage;
                $scope.logoFileName = $scope.user.Logo;

                $scope.addNewUser = false;
                if ($scope.panel) {

                    toastr.info("User Information panel disabled");
                }
                else
                    toastr.info("User Information panel enabled");

            }
            
        }

        $scope.uploadLogo = function ($files, id) {

            //$files: an array of files selected, each file has name, size, and type.

            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                vm.upload = usersFactory.uploadLogo(file, id)
                .progress(function (evt) {
                    ////console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                    //toastr.info("Uploading...");
                }).success(function (data, status, headers, config) {
                    toastr.success('Uploaded logo successfully ');
                }).error(function (err) {
                    toastr.error('Error occured during logo upload');
                });

            }
        }

        $scope.uploadBackground = function ($files, id) {
            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                vm.upload = usersFactory.uploadBackground(file, id)
                .progress(function (evt) {
                    ////console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                    //toastr.info("Uploading...");
                }).success(function (data, status, headers, config) {
                    toastr.success('Uploaded background successfully ');
                }).error(function (err) {
                    toastr.error('Error occured during background upload');
                });

            }
        }

        $scope.enableUserAdd = function()
        {
            $scope.panel = false;
            $scope.noExpiration = false;
            $scope.newUser = true;
            $scope.activeDelete = true;
            $scope.activeEdit = true;
            $scope.activeUsername = true;
            $scope.activeEmail = true;

            //if ($scope.panel) {
                
            //    toastr.info("User Information panel disabled");
            //}
            //else
            //    toastr.info("User Information panel enabled");
        }

        $scope.reloadPage = function()
        {
            var url = '/users/manage';
            $scope.user = CurrentUser.getUserInfo();
            $location.path(url);
            $route.reload();
        }

        $scope.loadPage = function () {
            $('#right-panel').show();
            $('#user-details-panel').show();
            $('#group-details-panel').hide();
        }

        $scope.clickBackgroundImageUploadButton = function () {
            $('#backgroundImageUploadButton').click();
        }

        $scope.updateBackgroundImageFileName = function () {
            $scope.backgroundImageFileName = $scope.backgroundImageFile[0].name;
        }

        $scope.clickLogoUploadButton = function () {
            $('#logoUploadButton').click();
        }

        $scope.updateLogoFileName = function () {
            $scope.logoFileName = $scope.logoFile[0].name;
        }

        function adjustTreeNodes() {
            if ($('.treeNode').length == 0) {
                setTimeout(adjustTreeNodes, 1);
            }
            else {
                $('.treeNode').each(function () {

                    var width = 20;

                    $(this).children().each(function () {
                        width += $(this)[0].offsetWidth;
                    });

                    if (width > 20) {
                        $(this).css('width', width + 'px');
                        $(this).css('min-width', width + 'px');
                    }
                });
            }
        }


        function getRoles()
        {
            $scope.isDefaultSuperAdmin = false;
            var roles = [];
            var AccessType = $scope.user.AccessType;

            if ($scope.newUser) {
                AccessType = $scope.currentRole + 1;
            }

            if (($scope.currentUser == 'defaultsuperadmin') || ($scope.user.UserId == 1))
            {
                $scope.isDefaultSuperAdmin = true;
                roles = [{ "value": "Super Administrator", "Id": 1 },
                          { "value": "Administrator", "Id": 2 },
                          { "value": "User", "Id": 3 }];
                $scope.showAdmin = true;
            }
            else if (AccessType == 1) {
                roles = [{ "value": "Super Administrator", "Id": 1 },
                          { "value": "Administrator", "Id": 2 },
                          { "value": "User", "Id": 3 }];
                $scope.showAdmin = true;
            }
            else if (AccessType == 2)
            {
                roles = [{ "value": "Administrator", "Id": 2 },
                          { "value": "User", "Id": 3 }];
                $scope.showAdmin = true;
            }
            else if (AccessType == 3) {
                roles = [{ "value": "User", "Id": 3 }];
                $scope.showAdmin = true;
            }

            
            return roles;
           
        }


        function findRole(accessType) {
            for (ctr = 0; ctr < $scope.roles.length; ctr++) {
                if ($scope.roles[ctr].Id == accessType)
                    return $scope.roles[ctr];
            }
        }

        function getStatus()
        {
            var status = [{ "UserStatus": "Active", "value": "Active" },
                          { "UserStatus": "Inactive", "value": "Inactive" }];

           
            return status;
        }
        function validateEmail(data) {
            var pattern = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
            if (pattern.test(data)) {
                return true;
            } else {
                return false;
            }
        }
        function validateDate(data)
        {
            var today = new Date();
            var date = new Date(data);
            //data = parseDate(data);    
            if (date instanceof Date)
            {
                if (date > today) {
                    return true;
                }
                
            }

            if(data > today)
            {
                return true;
            }

            return false;

        }
        function validateUser(data) {
            var pattern = /^[a-zA-Z0-9_-]{6,50}$/;
            if (pattern.test(data)) {
                return true;
            } else {
                return false;
            }
        }
        function Validate(user)
        {
            if (user.GivenName == '' || user.GivenName == null || user.GivenName == undefined) {
                toastr.error("Firstname cannot be empty");
                $scope.loading = false;
                return false;
            }

            if (user.Surname == '' || user.Surname == null || user.Surname == undefined) {
                toastr.error("Lastname cannot be empty");
                $scope.loading = false;
                return false;
            }

            if (user.EmailAddress == '' || user.EmailAddress == null || user.EmailAddress == undefined) {
                toastr.error("Email cannot be empty");
                $scope.loading = false;
                return false;
            }
            else if (validateEmail(user.EmailAddress)) {


            }
            else {
                toastr.error("Invalid email");
                $scope.loading = false;
                return false;
            }

            if (user.Username == '' || user.Username == null || user.Username == undefined) {
                toastr.error("Username cannot be empty");
                $scope.loading = false;
                return false;
            }
            if (!validateUser(user.Username))
            {
                toastr.error("Username must consist atleast 6 characters and maximum of 20");
                $scope.loading = false;
                return false;
            }


            


            if ((user.Expiration != null ||
                user.Expiration != undefined ||
                $scope.noExpiration))
            {                
                if (!validateDate(user.Expiration) && !$scope.noExpiration) {
                    toastr.error("Date must be greater than today");
                    $scope.loading = false;
                    return false;
                }
            }
            else if(user.Expiration == null)
            {
                user.Expiration = defaultExpiry();
                if ((user.Expiration != null ||
               user.Expiration != undefined ||
               $scope.noExpiration)) {
                    if (!validateDate(user.Expiration) && !$scope.noExpiration) {
                        toastr.error("Date must be greater than today");
                        $scope.loading = false;
                        return false;
                    }
                }
        
            }
            else
            {
                toastr.error("Date must not be empty");
                $scope.loading = false;
                return false;
            }

            if ((user.UserId != $scope.loggedUser.UserId) && ($scope.user.Group == null))
            {
                toastr.error("Group is required. If there are no groups available, please create one.");
                $scope.loading = false;
                return false;
            }

            return true;
               
        }
        function defaultExpiry()
        {
            var date = new Date();
            date.setDate(date.getDate() + 7);

            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();

            if (month < 10) month = "0" + month;
            if (day < 10) day = "0" + day;

            var today = year + "-" + month + "-" + day;

            return today;
        }
        function parseDate(data)
        {
            var rawDate = data;
            data = new Date(parseInt(rawDate.substr(6)));
            return data;
        }
            
        function TickNoExpiry()
        {
            document.getElementById("noExpiry").checked = true;
        }
        function ResetNoExpiry()
        {
            document.getElementById("noExpiry").checked = false;
        }
        function findGroup(groupID) {
            for (ctr = 0; ctr < $scope.groups.length; ctr++)
            {
                if ($scope.groups[ctr].ID == groupID)
                    return $scope.groups[ctr];
            }
        }

        function GetUserFolderAccess()
        {
            if (($scope.variableTree != null) && ($scope.variableTree != undefined)) {
                if ($scope.variableTree[0].length > 0) {
                    for (ctr = 0; ctr < $scope.variableTree[0].length; ctr++) {
                        if ($scope.variableTree[0][ctr].UserHasAccess) {
                            $scope.variableTreeIDs.push($scope.variableTree[0][ctr].ID);

                            if (($scope.variableTree[0][ctr].ChildVariables != null) && (($scope.variableTree[0][ctr].ChildVariables != undefined))) {
                                GetUserFolderAccessChild($scope.variableTree[0][ctr].ChildVariables);
                            }
                        }
                    }
                }
            }
        }

        function GetUserFolderAccessChild(variableTreeChild)
        {
            if (variableTreeChild.length > 0) {
                for (counter = 0; counter < variableTreeChild.length; counter++) {
                    if (variableTreeChild[counter].UserHasAccess) {
                        $scope.variableTreeIDs.push(variableTreeChild[counter].ID);

                        if ((variableTreeChild[counter].ChildVariables != null) && ((variableTreeChild[counter].ChildVariables != undefined))) {
                            GetUserFolderAccessChild(variableTreeChild[counter].ChildVariables);
                        }
                    }
                }
            }
        }

        $scope.loadGroup = function (id, userId) {

            loadGroup(id, userId);

        };

        $scope.$on('timer-tick', function (event, args) {
            $timeout(function () {
                var dateNow = new Date();
                var expiry = Expiration.getExpiry();
                if (+dateNow >= +expiry)
                {
                    var url = '/';
                    $location.path(url);
                    $route.reload();
                    toastr.error("Your access is expired");
                }

            });
        });
            miscService.loadTheme();

        function getAuditTrail() {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/api/AuditTrail/get' })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        $scope.AuditColumns = ["Log", "DateTime Stamp"];
        $scope.AuditTrailLogs = [];

        getAuditTrail().then(function (result) {
            if (typeof result == "string")
                result = JSON.parse(result);

            $scope.AuditTrailLogs = result;
        });
    });
