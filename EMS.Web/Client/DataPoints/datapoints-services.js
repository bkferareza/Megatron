datapointModule.factory('datapointsFactory', ['$http', '$q', '$upload', function ($http, $q, $upload) {
    return {
        getDatapoints: function () {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/DataPointManagement/datapoints' })
            .success(function (data, status, header, config) {
                console.log(data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        getVariableTree: function (userId) {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/DataPointManagement/variabletree', params: { value: JSON.stringify(userId) } })
            .success(function (data, status, header, config) {
                console.log(data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        getdDatapoint: function (datapointName) {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/DataPointManagement/get-datapoint', params: { value: JSON.stringify(datapointName) } })
            .success(function (data, status, header, config) {
                console.log(data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        newDatapoint: function () {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/DataPointManagement/new-datapoint' })
            .success(function (data, status, header, config) {
                console.log(data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        deleteDatapoint: function (datapoint) {
            var deferred = $q.defer();

            $http({ method: 'POST', url: '/DataPointManagement/delete-datapoint', params: { value: JSON.stringify(datapoint) } })
            .success(function (data, status, header, config) {
                console.log(data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        saveChanges: function (datapoint) {
            var deferred = $q.defer();

            $http({ method: 'POST', url: '/DataPointManagement/save-variable-tree', params: { value: JSON.stringify(datapoint) } })
            .success(function (data, status, header, config) {
                console.log(data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        uploadIconFile: function (file, variableTreeId) {
            return $upload.upload({ url: '/api/misc/uploadIcon?id=' + variableTreeId, file: file });
        },
        previewImportDatapoint: function (file) {
            return $upload.upload({ url: '/DataPointManagement/preview-import-datapoint', file: file });
        },
        importDatapoint: function (file) {
            return $upload.upload({ url: '/DataPointManagement/import-datapoint', file: file });
        }
    }
}]);