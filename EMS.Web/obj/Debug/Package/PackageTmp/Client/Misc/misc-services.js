/// <reference path="C:\Projects\EnergyMonitoringSystem\Source\Dev\EMS\EMS.Web\Scripts/angular.js" />
/// <reference path="../app.js" />
var miscService = function ($http, $q) {

    function applyStyle(element, style) {
        switch (style) {
            case 0: break;

            case 1:
                element.css('background-position', 'center');
                element.css('background-repeat', 'no-repeat');
                element.css('background-attachment', 'fixed');
                break;
            case 2:
                element.css('background-size', 'cover');
                break;
            case 3:

                break;
            case 4:
                element.css('background-repeat', 'repeat');
                break;
        }
    }

    function parseStamp(url) {
        var parameters = url.substring(url.lastIndexOf("?") + 1, url.length - 1);
        var aParameter = parameters.split("&");
        for (var x = 0; x < aParameter.length; x++) {
            var parameter = aParameter[x];
            if (parameter.contains('stamp=')) {
                return parameter.replace('stamp=', '');
            }
        }
        return "";
    }

    return {
        loadTheme: function () {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/api/misc/getbgstamp' })
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function (message) {
                    deferred.reject(message);
                });

            deferred.promise.then(function (data) {
                var element = angular.element('body');
                if (data == null) {
                    element.css('background-image', '');
                    return;
                }
                var stamp = data.stamp;

                var regularStamp = 'url(/api/misc/getbackgroundimage?stamp=' + stamp + ')';

                var element = angular.element('body');
                
                if (parseStamp(element.css('background-image')) != stamp) element.css('background-image', regularStamp);
                    
                applyStyle(element, data.style);
            });
        },
        loadDefaultTheme: function () {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/api/misc/getdefaultbgstamp' })
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function (message) {
                    deferred.reject(message);
                });

            var deferred = $q.defer();

            deferred.promise.then(function (data) {
                var element = angular.element('body');
                if (data == null) {
                    element.css('background-image', '');
                    return;
                }
                var stamp = data.stamp;

                var defaultStamp = 'url(/api/misc/getdefaultbackgroundimage?stamp=' + stamp + ')';

                var element = angular.element('body');

                if (parseStamp(element.css('background-image')) != stamp) element.css('background-image', defaultStamp);

                applyStyle(element, data.style);
            });

        },
        hasDefaultLogo: function () {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/api/misc/hasDefaultLogo' })
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function (message) {
                    deferred.reject(message);
                });

            return deferred.promise;
        },
        hasLogo: function () {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/api/misc/hasLogo' })
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function (message) {
                    deferred.reject(message);
                });

            return deferred.promise;
        }
    }
}

miscService.$inject = ['$http', '$q'];

app.factory('miscService', miscService);