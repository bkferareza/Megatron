var auditTrailModule = angular.module('auditTrailModule', ['ngRoute', 'ngResource'])
.config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
});

'use strict'
auditTrailModule.factory('auditTrailFactory', ['$http', '$q', function ($http, $q) {
    return {
        getAuditTrail: function () {
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


    }
}]);