datapointModule.controller('datapointController',
    function ($scope, toastr, $location, CurrentUser,
        $timeout, keys, $upload, Expiration,$route,
        Logout, CurrentRole, miscService, datapointsFactory,
        GeneralConfiguration, auditTrailFactory, Permissions) {

        $scope.hasLogo = false;
        $scope.logoUrl = "/api/misc/getlogo?stamp=" + Date.now().toString();
        miscService.hasLogo().then(function (data) { $scope.hasLogo = data; });
        miscService.loadTheme();
    
        var vm = this;
        $scope.addFolderModal = false;
        $scope.addDataPointModal = false;
        $scope.importModal = false;
        $scope.previewResultsModal = false;
        $scope.isSelectedFolder = false;
        $scope.isSelectedDatapoint = false;
        $scope.iconFileName = '';
        $scope.importFileName = '';
        $scope.importFileValid = false;
        $scope.newVariableTree = false;
        $scope.isRootFolder = false;
        $scope.canDelete = false;
        $scope.panel = false;
        $scope.parentID = null;
        $scope.currentUser = CurrentUser.getUser();
        $scope.Expiration = Expiration.getExpiryInMS();
        $scope.hideManage = CurrentRole.IsAdmin();
        $scope.$GeneralConfiguration = GeneralConfiguration;
        $scope.$Permissions = Permissions;

        if ($scope.$Permissions.permissions().CanModifyUsers && $scope.$Permissions.permissions().CanModifyTemplates && $scope.$Permissions.permissions().CanCreateFoldersDatapoints) {
            $scope.hideManage = true;
        }
        else {
            $scope.hideManage = false;
        }

        $scope.page.setTitle('EMS Data Point Management Page');
        $scope.variableTree = [];
        $scope.previewFileResults = [];
        $scope.parameters = {
            dragEnabled: false,
            emptyPlaceholderEnabled: false,
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

        $scope.loggedUser = CurrentUser.getUserInfo();
        $scope.loggedUser.UserId = $scope.loggedUser.ID;

        datapointsFactory.getVariableTree($scope.loggedUser.UserId)
        .then(function (result) {
            var data = [];
            data.push(result);
            $scope.variableTree = data;

            var height = $(window).height() - 110;
            $('#left-panel').height(height);

            setTimeout(adjustTreeNodes, 1);
        });

        $scope.keys = keys;
        $scope.reloadPage = function () {
            var url = '/datapoints/manage';
            $scope.user = CurrentUser.getUserInfo();
            $location.path(url);
            $route.reload();
        }
        
        $scope.loading = false;
        $scope.Message = "";
        $scope.close = function()
        {
            $scope.addFolderModal = false;
            $scope.addDataPointModal = false;
            $scope.importModal = false;
        }

        $scope.openFolderModal = function(root)
        {
            $scope.newVariable();
            $scope.datapoint.Type = 1;
            $scope.addFolderModal = !$scope.addFolderModal;
            $scope.addDataPointModal = false;
            $scope.isRootFolder = root;
            $scope.newVariableTree = true;
            $scope.iconFileName = '';
        }

        $scope.openDataPointModal = function()
        {
            $scope.newVariable();
            $scope.datapoint.Type = 2;
            $scope.addDataPointModal = !$scope.addDataPointModal;
            $scope.addFolderModal = false;
            $scope.newVariableTree = true;
            $scope.iconFileName = '';
        }

        $scope.openImportModal = function () {
            $scope.importModal = !$scope.importModal;
            $scope.importFileName = '';
        }

        $scope.logOut = function () {
            Logout.logOut();
            var url = '/';
            $location.path(url);
            $route.reload();
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

        $scope.showToggle = function (items) {
            var variableTree = items.$modelValue;

            if (variableTree.ChildVariables != null) {
                return variableTree.ChildVariables.length > 0;
            }

            return false;
        }

        $scope.modify = function (item) {
            $scope.datapoint = angular.copy(item.$modelValue);
            $scope.iconFileName = $scope.datapoint.Icon;
            $scope.newVariableTree = false;
            $scope.parentID = $scope.datapoint.ID;
            $scope.panel = true;

            if ($scope.datapoint.ChildVariables == null) {
                $scope.canDelete = true;
            }
            else {
                $scope.canDelete = false;
            }

            if ($scope.datapoint.Type == 1)
            {
                $scope.isSelectedFolder = true;
                $scope.isSelectedDatapoint= false;
            }
            else if ($scope.datapoint.Type == 2) {
                $scope.isSelectedFolder = false;
                $scope.isSelectedDatapoint = true;
            }
            else {
                $scope.isSelectedFolder = false;
                $scope.isSelectedDatapoint = false;
            }
        }

        $scope.uploadIconFile = function ($files, id) {
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                vm.upload = datapointsFactory.uploadIconFile(file, id)
                .progress(function (evt) {
                }).success(function (data, status, headers, config) {
                    toastr.success('Uploaded icon successfully ');
                }).error(function (err) {
                    toastr.error('Error occured during icon upload');
                });

            }
        }

        $scope.previewImport = function () {
            $scope.previewImportDatapoint($scope.importFile);
        }

        $scope.saveImport = function () {
            $scope.loading = true;
            $scope.Message = "Importing...";

            $scope.importDatapoint($scope.importFile);
        }

        $scope.closePreviewResultWindow = function () {
            $scope.importModal = true;
            $scope.previewResultsModal = false;
        }

        $scope.previewImportDatapoint = function ($files) {
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                vm.upload = datapointsFactory.previewImportDatapoint(file)
                .progress(function (evt) {
                }).success(function (data, status, headers, config) {

                    if (data.Successful) {
                        $scope.previewFileResults = data.Entity;

                        $scope.importFileValid = false;

                        for (var j = 0; j < $scope.previewFileResults.length; j++) {
                            if ($scope.previewFileResults[j].Status == "OK") {
                                $scope.importFileValid = true;
                                j = $scope.previewFileResults.length;
                            }
                        }

                        $scope.importModal = false;
                        $scope.previewResultsModal = true;
                    }
                    else
                    {
                        toastr.error(data.Errors[0]);
                    }

                    //toastr.success('File successfully previewed');
                }).error(function (err) {
                    toastr.error('Error occured during file upload');
                });

            }
        }

        $scope.importDatapoint = function ($files) {
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                vm.upload = datapointsFactory.importDatapoint(file)
                .progress(function (evt) {
                }).success(function (data, status, headers, config) {
                    $scope.importModal = false;
                    $scope.previewResultsModal = false;
                    
                    $scope.reloadPage();
                    $scope.loading = false;

                    toastr.success('File successfully imported');
                }).error(function (err) {
                    toastr.error('Error occured during file upload');
                    $scope.loading = false;
                });

            }
        }

        $scope.clickIconUploadButtonAddDatapoint = function () {
            $('#iconUploadButtonAddDatapoint').click();
        }

        $scope.clickIconUploadButtonAddFolder = function () {
            $('#iconUploadButtonAddFolder').click();
        }

        $scope.clickIconUploadButton = function () {
            $('#iconUploadButton').click();
        }

        $scope.clickImportUploadButton = function () {
            $('#importUploadButton').click();
        }

        $scope.updateIconFileName = function () {
            if ($scope.iconFile != undefined) {
                $scope.iconFileName = $scope.iconFile[0].name;
            }
        }

        $scope.updateImportFileName = function () {
            if (($scope.importFile != undefined) && ($scope.importFile != "")) {
                $scope.importFileName = $scope.importFile[0].name;
            }
        }

        $scope.$on('timer-tick', function (event, args) {
            $timeout(function () {
                var dateNow = new Date();
                var expiry = Expiration.getExpiry();
                if (+dateNow >= +expiry) {
                    var url = '/';
                    $location.path(url);
                    $route.reload();
                    toastr.error("Your access is expired");
                }

            });
        });


        $scope.list = [];
        $scope.datapoint = {};

        //datapointsFactory.getDatapoints()
        //.then(function(result)
        //{
        //    $scope.list = result;
        //}
        //);

        $scope.newVariable = function()
        {
            datapointsFactory.newDatapoint()
            .then(function (result) {
                $scope.datapoint = result;
            });
        }

       

        $scope.deleteVariable = function (datapoint)
        {
            datapointsFactory.deleteDatapoint(datapoint.ID)
            .then(function (result) {

                if (result.Successful) {
                    toastr.success("Record is successfully deleted");
                    $scope.reloadPage();
                }
                else
                {
                    toastr.error(result.Error);
                }
            });
        }

        $scope.saveChanges = function (datapoint) {
            $scope.loading = true;
            $scope.Message = "Saving...";

            var valid = Validate(datapoint);

            if (datapoint.Icon == '' || datapoint.Icon == null || datapoint.Icon == undefined) {
                datapoint.Icon = 'defaultIcon'
            }

            if (datapoint.Color == '' || datapoint.Color == null || datapoint.Color == undefined) {
                datapoint.Color = '#000000'
            }

            var uploadIcon = false;

            if ((datapoint.Icon != $scope.iconFileName) && ($scope.iconFile != undefined)) {
                if (($scope.Icon != "") || ($scope.Icon != 'defaultIcon')) {
                    uploadIcon = true;
                    datapoint.Icon = $scope.iconFileName;
                }
            }

            if ($scope.newVariableTree) {
                if ($scope.isRootFolder) {
                    datapoint.ParentID = null;
                }
                else {
                    datapoint.ParentID = $scope.parentID;
                }

                if ($scope.addDataPointModal) {
                    datapoint.Type = 2;
                }
                else {
                    datapoint.Type = 1;
                }
            }

            if (valid) {

                datapointsFactory.saveChanges(datapoint)
                .then(function (result) {
                    if (result.Successful) {

                        if (uploadIcon) {
                            $scope.uploadIconFile($scope.iconFile, result.ID);
                        }

                        $scope.reloadPage();
                        toastr.success('Save successfully');
                        $scope.loading = false;

                    }
                    else {
                        toastr.error('Error saving! ' + result.Errors[0]);
                        $scope.loading = false;
                    }

                });
            }
        }

        function Validate(datapoint) {

            if (datapoint.TagName == '' || datapoint.TagName == null || datapoint.TagName == undefined) {
                toastr.error("Tag Name cannot be empty");
                $scope.loading = false;
                return false;
            }

            if (datapoint.FriendlyName == '' || datapoint.FriendlyName == null || datapoint.FriendlyName == undefined) {
                toastr.error("Friendly Name cannot be empty");
                $scope.loading = false;
                return false;
            }

            if ($scope.iconFile != undefined) {
                if ($scope.iconFile[0].size > 10000) {
                    toastr.error("Icon size is greater than 10kb. Please upload a smaller file");
                    $scope.loading = false;
                    return false;
                }
            }

            return true;

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

        //AuditTrail


        $scope.AuditColumns = ["Log", "DatetimeStamp"];
        $scope.AuditTrailLogs = [];

        auditTrailFactory.getAuditTrail()
            .then(function (result) {
                if (typeof result == "string")
                    result = JSON.parse(result);

                $scope.AuditTrailLogs = result;
            });

    });