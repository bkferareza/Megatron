//groupsModule.controller('groupsController',
//    function ($scope, toastr, $location, CurrentUser, Expiration, Logout, CurrentRole,$timeout, miscService) {
//        $scope.hasLogo = false;
//        $scope.logoUrl = "/api/misc/getlogo?stamp=" + Date.now().toString();
//        miscService.hasLogo().then(function (data) { $scope.hasLogo = data; });
//        miscService.loadTheme();

//        $scope.currentUser = CurrentUser.getUser();
//        $scope.Expiration = Expiration.getExpiryInMS();
//        $scope.hideManage = CurrentRole.IsAdmin();
//        $scope.page.setTitle('EMS Group Management Page');
//        $scope.loading = false;

//        $scope.user = CurrentUser.getUser();
//        $scope.currentUser = CurrentUser.getUser();
//        $scope.currentRole = CurrentRole.getUser();
//        $scope.group = CurrentGroup.getGroupInfo();
//        $scope.folders = [];
//        $scope.user.AccessType = $scope.roles[$scope.user.AccessType - 1];
//        $scope.user.Status = $scope.status[$scope.user.Status - 1];
//        $scope.user.Expiration = Expiration.getExpiry();
//        $scope.Expiration = Expiration.getExpiryInMS();
//        $scope.panel = true;
//        $scope.newGroup = false;

//        groupsFactory.getUserTree($scope.user.Username)
//        .then(function (result) {
//            var data = '[' + result + ']';
//            data = haveChild(data);
//            $scope.list = data;
//            console.log($scope.list);
//        });

//        $scope.parameters = {
//            dragEnabled: false,
//            emptyPlaceholderEnabled: true,
//            maxDepth: 10,
//            dragDelay: 0,
//            dragDistance: 0,
//            lockX: false,
//            lockY: false,
//            boundTo: '',
//            spacing: 20,
//            coverage: 50,
//            //cancelKey: 'esc',
//            //copyKey: 'shift',
//            //selectKey: 'ctrl',
//            enableExpandOnHover: true,
//            expandOnHover: 500,
//        };

//        $scope.keys = keys;

//        $scope.logOut = function () {
//            Logout.logOut();
//            var url = '/';
//            $location.path(url);
//            $route.reload();

//        }

//        $scope.addGroup = function () {
//            $scope.newGroup = true;
//            groupsFactory.addNewGroup()
//            .then(function (result) {
//                console.log(result);
//                $scope.group = result;
//                $scope.enableGroupAdd();
//            });
//        }

//        $scope.deleteUser = function (group) {
//            groupsFactory.deleteGroup(group)
//            .then(function (result) {
//                if (result.Successful) {
//                    toastr.success('Group deleted successfully');
//                    $scope.reloadPage();
//                }
//            });
//        }

//        //$scope.saveChanges = function (group) {

//        //    if (Validate(group) && $scope.newGroup) {
//        //        usersFactory.usernameCheck(user)
//        //        .then(function (result) {
//        //            if (result) {

//        //                usersFactory.emailCheck(user)
//        //                .then(function (result) {
//        //                    if (result) {
//        //                        usersFactory.saveChanges(user)
//        //                        .then(function (result) {
//        //                            console.log(result);
//        //                            $scope.reloadPage();
//        //                        });
//        //                    }
//        //                    else
//        //                        toastr.error('Email exists');
//        //                });

//        //            }
//        //            else
//        //                toastr.error('Username exists');
//        //        });
//        //    }
//        //    else {

//        //    }
//        //}

//        $scope.callbacks = {
//        };

//        $scope.remove = function (scope) {
//            scope.remove();
//        };

//        $scope.toggle = function (scope) {
//            scope.toggle();
//        };

//        $scope.newSubItem = function (scope) {
//            var nodeData = scope.$modelValue;
//            nodeData.items.push({
//                id: nodeData.id * 10 + nodeData.items.length,
//                title: nodeData.title + '.' + (nodeData.items.length + 1),
//                items: []
//            });
//        };

//        $scope.showToggle = function (scope) {
//            var data = scope.$modelValue;
//            if (data == undefined) {
//                return null;
//            }
//            console.log(data);
//            if (data.Child.length < 1) {
//                return false;
//            }

//            return true;
//        }

//        $scope.showAccess = function (scope) {
//            var data = scope.$modelValue;
//            if (data == undefined) {
//                return null;
//            }
//            if (data.type == 'datapoint') {
//                return false;
//            }

//            return true;
//        }

//        $scope.modify = function (scope) {
//            var data = scope.$modelValue;
//            if (data == undefined) {
//                return null;
//            }
//            $scope.user = data;
//            if ($scope.user.AccessType > -1) {
//                $scope.user.AccessType = $scope.roles[$scope.user.AccessType - 1];
//                $scope.user.Status = $scope.status[$scope.user.Status - 1];
//            }
//            $scope.addNewUser = false;
//            $scope.enableUserAdd();


//        }

//        $scope.enableGroupAdd = function () {
//            $scope.panel = !$scope.panel;

//            if ($scope.panel) {

//                toastr.info("Group Information panel disabled");
//            }
//            else
//                toastr.info("Group Information panel enabled");
//        }

//        $scope.reloadPage = function () {
//            var url = '/users/manage';
//            $location.path(url);
//        }
        
//        function Validate(group) {
//            if (group.Name == '' || group.Name == null || group.Name == undefined) {
//                toastr.error("Name cannot be empty");
//                return false;
//            }

//            return true;

//        }
//        function defaultExpiry() {
//            var date = new Date();
//            date.setDate(date.getDate() + 7);

//            var day = date.getDate();
//            var month = date.getMonth() + 1;
//            var year = date.getFullYear();

//            if (month < 10) month = "0" + month;
//            if (day < 10) day = "0" + day;

//            var today = year + "-" + month + "-" + day;

//            return today;
//        }

//        $scope.$on('timer-tick', function (event, args) {
//            $timeout(function () {
//                var dateNow = new Date();
//                var expiry = Expiration.getExpiry();
//                if (+dateNow >= +expiry) {
//                    var url = '/';
//                    $location.path(url);
//                    toastr.error("Your access is expired");
//                }

//            });
//        });

//        });


