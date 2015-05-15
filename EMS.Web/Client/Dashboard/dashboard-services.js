'use strict';
dashboardModule.factory('dashboardFactory', ['$http', '$q', function ($http, $q) {

    return {
        getGeneralConfiguration: function () {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/UserManagement/general-configuration' })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
            return deferred.promise;
        },
        getActiveTemplate: function (userId) {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/Dashboard/getTemplate', params: { value: JSON.stringify(userId) } })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
            return deferred.promise;
        },
        getChartsForActiveTemplate: function (templateId) {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/Dashboard/getCharts', params: { value: JSON.stringify(templateId) } })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
            return deferred.promise;
        },
        getChartDataPoints: function (chartId) {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/Dashboard/getChartDataPoints', params: { value: JSON.stringify(chartId) } })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
            return deferred.promise;
        },

        getGroupChartDataPoints: function (chartId) {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/Dashboard/getGroupChartDataPoints', params: { value: JSON.stringify(chartId) } })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
            return deferred.promise;
        },

        getLogs: function (chart) {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/Dashboard/get-logs', params: { value: JSON.stringify(chart) } })
            .success(function (data, status, header, config) {
                console.log(data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
    }

}]);