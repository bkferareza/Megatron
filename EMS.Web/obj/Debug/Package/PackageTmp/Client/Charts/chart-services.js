'use strict'
chartModule.factory('chartFactory', [
    '$http','$q',function($http,$q)
    {
        return {
            getCharts: function(templateId)
            {
                var deferred = $q.defer();

                $http({ method: 'GET', url: '/api/chart/getCharts', params: { value: JSON.stringify(templateId) } })
                .success(function (data, status, header, config) {
                    console.log(data);
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
                return deferred.promise;
            },
            newChart:function()
            {
              
                var deferred = $q.defer();

                $http({ method: 'GET', url: '/api/chart/newChart' })
                .success(function (data, status, header, config) {
                    console.log(data);
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
                return deferred.promise;
            },
            deleteChart: function(chart)
            {
                var deferred = $q.defer();

                $http({ method: 'POST', url: '/api/chart/deletechart', params: { value: JSON.stringify(chart) } })
                .success(function (data, status, header, config) {
                    console.log(data);
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
                return deferred.promise;
            },

            saveChartChanges: function (chart) {
                var deferred = $q.defer();

                $http({ method: 'POST', url: '/api/chart/savechanges', params: { value: JSON.stringify(chart) } })
                .success(function (data, status, header, config) {
                    console.log(data);
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
                return deferred.promise;
            },

            getDataPoints: function(chartId)
            {
                var deferred = $q.defer();

                $http({ method: 'GET', url: '/api/chart/getdatapoints', params: { value: JSON.stringify(chartId) } })
                .success(function (data, status, header, config) {
                    console.log(data);
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
                return deferred.promise;
            },

            getLogs: function (chart) {
                var deferred = $q.defer();

                $http({ method: 'GET', url: '/api/chart/get-logs', params: { value: JSON.stringify(chart) } })
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
    }
]);