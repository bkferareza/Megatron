'use strict';
templateModule.factory('templatesFactory', ['$http', '$q', '$upload', function ($http, $q, $upload) {
    return {
        getTemplates: function () {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/TemplateManagement/templates' })
            .success(function (data, status, header, config) {
                console.log(data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        getTemplate: function (templateName) {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/TemplateManagement/get-template', params: { value: JSON.stringify(templateName) } })
            .success(function (data, status, header, config) {
                console.log(data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        activateTemplate: function (templateid) {
            var deferred = $q.defer();

            $http({ method: 'POST', url: '/TemplateManagement/activate-template', params: { value: JSON.stringify(templateid) } })
            .success(function (data, status, header, config) {
                console.log(data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        newTemplate: function () {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/TemplateManagement/new-template' })
            .success(function (data, status, header, config) {
                console.log(data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        deleteTemplate: function (template) {
            var deferred = $q.defer();

            $http({ method: 'POST', url: '/TemplateManagement/delete-template', params: { value: JSON.stringify(template) } })
            .success(function (data, status, header, config) {
                console.log(data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        saveChanges: function (template) {
            var deferred = $q.defer();

            $http({ method: 'POST', url: '/TemplateManagement/save-changes', params: { value: JSON.stringify(template) } })
            .success(function (data, status, header, config) {
                console.log(data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        getLogs: function (chartId) {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/DataPointManagement/get-logs', params: { value: JSON.stringify(chartId) } })
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