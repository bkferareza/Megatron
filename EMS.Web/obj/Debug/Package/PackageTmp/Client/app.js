var app = angular.module('EMSApp', ['ngRoute', 'ngResource', 'usersModule', 'dashboardModule',
    'templateModule', 'datapointModule', 'discussionsModule', 'ngAnimate', 'ui.bootstrap', 'timer', 'angular.filter'])
    .value("toastr", toastr);


app.run(['$rootScope', function ($rootScope) {
    $rootScope.page = {
        setTitle: function (title) {
            this.title = title;
        }
    }

    //$rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
    //    $rootScope.page.setTitle(current.$$route.title || 'Default Title');
    //});
}]);

app.service("CurrentUser", function () {
    var _userName = null;
    var _userInfo = null;
    var _groupsOfUser = null;

    return {
        getUser: function () {
            return _userName
        },

        setUser: function (user) {
            _userName = user;
        },
        setUserInfo : function(user)
        {
            _userInfo = user;
        },
        getUserInfo: function()
        {
            return _userInfo;
        },
        setGroupsOfUser: function (groups) {
            _groupsOfUser = groups;
        },
        getGroupsOfUser: function () {
            return _groupsOfUser;
        }
    }
});

app.service("CurrentRole", function () {
    var _role = null;
    var isAdmin = null;

    return {
        getUser: function () {
            return _role
        },

        setUser: function (role) {

            _role = role;
            
            if(_role != 3)
            {
                isAdmin = true;
            }
            else
            {
                isAdmin = false;
            }
        },
        IsAdmin: function()
        {
            return isAdmin;
        }

    }
});

app.service("GeneralConfiguration", ['$http', '$q', function ($http, $q) {
    var _generalConfiguration = null;
    var _startOfWeek = getStartOfWeek();
    var _generalConfigurationCanSave = false;

    return {
        generalConfiguration: function () {
            return _generalConfiguration;
        },
        startOfWeek: function () {
            return _startOfWeek;
        },
        generalConfigurationCanSave: function () {
            return _generalConfigurationCanSave;
        },

        getGeneralConfig: function () {
            getGeneralConfiguration()
                .then(function (result) {
                    if (result.Successful)
                    {
                        _generalConfiguration = result.Entity;
                        _generalConfiguration.StartOfWeek = findStartOfWeek(_generalConfiguration.StartOfWeek);
                        document.body.style.fontSize = _generalConfiguration.FontSize + 'px';
                    }
                    else
                    {
                        toastr.error("Failed to retrieve General Configuration");
                    }
                });
        },

        saveGeneralConfig: function () {
            _generalConfiguration.StartOfWeek = _generalConfiguration.StartOfWeek.value;
            saveGeneralConfiguration(_generalConfiguration)
                .then(function (result) {
                    if (result.Successful) {
                        toastr.success("General Configuration was successfully saved");
                        _generalConfigurationCanSave = false;
                        document.body.style.fontSize = _generalConfiguration.FontSize + 'px';
                        _generalConfiguration.StartOfWeek = findStartOfWeek(_generalConfiguration.StartOfWeek);
                    }
                    else {
                        toastr.error(result.Errors[0]);
                    }
                });
        },

        changeGeneralConfig: function (val) {

            value = "";
            
            if (val == undefined)
            {
                value = val;
            }
            else
            {
                if (val.StartOfWeek != undefined) {
                    value = val.StartOfWeek;
                }
                else {
                    value = val;
                }
            }

            if ((value == null) || (value == undefined))
            {
                _generalConfigurationCanSave = false;
            }
            else if (value.trim() == "") {
                _generalConfigurationCanSave = false;
            }
            else {
                _generalConfigurationCanSave = true;
            }
        }
        
    }

    function getGeneralConfiguration() {
        var deferred = $q.defer();

        $http({ method: 'GET', url: '/UserManagement/general-configuration' })
            .success(function (data, status, header, config) {
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });
        return deferred.promise;
    }

    function saveGeneralConfiguration(generalConfig) {
        var deferred = $q.defer();

        $http({ method: 'POST', url: '/UserManagement/save-general-configuration', params: { value: JSON.stringify(generalConfig) } })
            .success(function (data, status, header, config) {
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });
        return deferred.promise;
    }

    function getStartOfWeek() {
        var startOfWeek = [{ "StartOfWeek": "Sunday", "value": "Sunday" },
                      { "StartOfWeek": "Monday", "value": "Monday" },
                      { "StartOfWeek": "Tuesday", "value": "Tuesday" },
                      { "StartOfWeek": "Wednesday", "value": "Wednesday" },
                      { "StartOfWeek": "Thursday", "value": "Thursday" },
                      { "StartOfWeek": "Friday", "value": "Friday" },
                      { "StartOfWeek": "Saturday", "value": "Saturday" }];


        return startOfWeek;
    }

    function findStartOfWeek(startOfWeekSel) {
        for (ctr = 0; ctr < _startOfWeek.length; ctr++) {
            if (_startOfWeek[ctr].StartOfWeek == startOfWeekSel)
                return _startOfWeek[ctr];
        }
    }
}]);

app.service("Expiration", function () {
    var _expiry = null;
    var expired = false;
    var _expiryInSeconds = null;
    return {
        getExpiry:function()
        {
            return _expiry;
        },
        setExpiry:function(expiry)
        {
            var one_day = 1000 * 60 * 60 * 24;
            var dateNow = new Date();
            var expiryDate = expiry.getTime();
            var today = dateNow.getTime();
            if (expiryDate < today)
            {
                expired = true;
                _expiry = 0;
            }
            else
            {
                var difference = expiryDate - today;
                _expiry = expiry;
                _expiryInSeconds = Math.round(difference / 1000);
            }
           

            if (+dateNow <= +expiry)
                expired = true;
        },
        getExpiryInMS:function()
        {
            return _expiryInSeconds;
        },
        isExpired:function()
        {
            return expired;
        }
        
    }
});

app.service("Logout", function ($http)
{
    return {
        logOut:function()
        {
            $http.get('/Login/logout');
        }
    }
});

app.directive('uiColorpicker', function () {
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: false,
        replace: true,
        template: "<span><input class='input-small' /></span>",
        link: function (scope, element, attrs, ngModel) {
            var input = element.find('input');
            var options = angular.extend({
                color: ngModel.$viewValue,
                change: function (color) {
                    scope.$apply(function () {
                        ngModel.$setViewValue(color.toHexString());
                    });
                }
            }, scope.$eval(attrs.options));

            ngModel.$render = function () {
                input.spectrum('set', ngModel.$viewValue || '');
            };

            input.spectrum(options);
        }
    };
});

app.directive('modalDialog', function () {
    return {
        restrict: 'E',
        scope: {
            show: '='
        },
        replace: true, // Replace with the template below
        transclude: true, // we want to insert custom content inside the directive
        link: function (scope, element, attrs) {
            scope.dialogStyle = {};
            if (attrs.width)
                scope.dialogStyle.width = attrs.width;
            if (attrs.height)
                scope.dialogStyle.height = attrs.height;
            scope.hideModal = function () {
                scope.show = false;
            };
        },
        template: "<div class='ng-modal' ng-show='show'><div class='ng-modal-overlay'></div><div class='ng-modal-dialog' ng-style='dialogStyle'><div class='ng-modal-dialog-content' ng-transclude></div></div></div>"
    };
});

app.directive('modalDialogA', function () {
    return {
        restrict: 'E',
        scope: {
            show: '='
        },
        replace: true, // Replace with the template below
        transclude: true, // we want to insert custom content inside the directive
        link: function (scope, element, attrs) {
            scope.dialogStyle = {};
            if (attrs.width)
                scope.dialogStyle.width = attrs.width;
            if (attrs.height)
                scope.dialogStyle.height = attrs.height;
            scope.hideModal = function () {
                scope.show = false;
            };
        },
        template: "<div class='ng-modal' ng-show='show'><div class='ng-modal-overlay' ng-click='hideModal()'></div><div class='ng-modal-dialog' ng-style='dialogStyle'><div class='ng-modal-close' ng-click='hideModal()'>X</div><div class='ng-modal-dialog-content' ng-transclude></div></div></div>"
    };
});

app.directive('accordion_', function () {
    return {
        restrict: 'EA',
        //replace: true,
        transclude: true,
        template: '<div data-ng-transclude=""></div>',
        controller: function () {
            var expanders = [];

            this.gotOpened = function (selected_expander) {
                angular.forEach(expanders, function (expander) {
                    if (selected_expander != expander)
                        expander.showMe = false;
                });
            };

            this.addExpander = function (expander) {
                expanders.push(expander);
            };
        }
    };
});

app.directive('charLimit', function () {
    return {
        restrict: 'A',
        link: function ($scope, $element, $attributes) {
            var limit = $attributes.charLimit;

            $element.bind('keyup', function (event) {
                var element = $element.parent().parent();

                element.toggleClass('warning', limit - $element.val().length <= 10);
                element.toggleClass('error', $element.val().length > limit);
            });

            $element.bind('keypress', function (event) {
                // Once the limit has been met or exceeded, prevent all keypresses from working
                if ($element.val().length >= limit) {
                    // Except backspace
                    if (event.keyCode != 8) {
                        event.preventDefault();
                    }
                }
            });
        }
    };
});

app.directive('naitConfirmClick', function ($modal, $parse) {
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {
            if (!attrs.do) {
                return;
            }

            // register the confirmation event
            var confirmButtonText = attrs.confirmButtonText ? attrs.confirmButtonText : 'OK';
            var cancelButtonText = attrs.cancelButtonText ? attrs.cancelButtonText : 'Cancel';
            element.click(function () {
                // action that should be executed if user confirms
                var doThis = $parse(attrs.do);

                // condition for confirmation
                if (attrs.confirmIf) {
                    var confirmationCondition = $parse(attrs.confirmIf);
                    if (!confirmationCondition(scope)) {
                        // if no confirmation is needed, we can execute the action and leave
                        doThis(scope);
                        scope.$apply();
                        return;
                    }
                }
                $modal
                    .open({
                        template:
                            '<div class="modal-body">' + attrs.confirm + '</div>'
                            + '<div class="modal-footer">'
                            + '<button type="button" class="btn btn-default btn-naitsirch-confirm pull-right" ng-click="$close(\'ok\')">' + confirmButtonText + '</button>'
                            + '<button type="button" class="btn btn-default btn-naitsirch-cancel pull-right" ng-click="$dismiss(\'cancel\')">' + cancelButtonText + '</button>'
                            + '</div>'
                    })
                    .result.then(function () {
                        doThis(scope);
                        // scope.$apply();
                    });
            });
        }
    };
});

app.filter('trusted', ['$sce', function ($sce) {
    return function (url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);

app.directive('validInput', function () {
    return {
        require: '?ngModel',
        scope: {
            "inputPattern": '@'
        },
        link: function (scope, element, attrs, ngModelCtrl) {

            var regexp = null;

            if (scope.inputPattern !== undefined) {
                regexp = new RegExp(scope.inputPattern, "g");
            }

            if (!ngModelCtrl) {
                return;
            }

            ngModelCtrl.$parsers.push(function (val) {
                if (regexp) {
                    var clean = val.replace(regexp, '');
                    if (val !== clean) {
                        ngModelCtrl.$setViewValue(clean);
                        ngModelCtrl.$render();
                    }
                    return clean;
                }
                else {
                    return val;
                }

            });

            element.bind('keypress', function (event) {
                if (event.keyCode === 32) {
                    event.preventDefault();
                }
            });
        }
    }
});

//angular.bootstrap(document, ['app']);

function TimerController($scope, Expiration) {
    $scope.timerRunning = true;
    $scope.startTimer = function () {
        $scope.$broadcast('timer-start');
        $scope.timerRunning = true;
    };

    $scope.stopTimer = function () {
        $scope.$broadcast('timer-stop');
        $scope.timerRunning = false;
    };

    $scope.$on('timer-stopped', function (event, data) {
        console.log('Timer Stopped - data = ', data);
        toastr.info(data);

    });
 

}
TimerController.$inject = ['$scope', 'Expiration'];