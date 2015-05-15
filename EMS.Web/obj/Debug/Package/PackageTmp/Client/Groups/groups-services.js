//'use strict';
//groupsModule.factory('groupsFactory', ['$http', '$q', function ($http, $q) {

//    return {
//        getGroupInfo: function (account) {
//            var deferred = $q.defer();

//            $http({ method: 'GET', url: '/UserManagement/groupInfo', params: { value: JSON.stringify(account) } })
//                .success(function (data, status, header, config) {
//                    deferred.resolve(data);
//                })
//                .error(function (data, status, headers, config) {
//                    deferred.reject(data);
//                });
//            return deferred.promise;
//        },
//        getUserTree: function (account) {
//            var deferred = $q.defer();

//            $http({ method: 'GET', url: '/UserManagement/user-tree', params: { value: JSON.stringify(account) } })
//            .success(function (data, status, header, config) {
//                console.log(data);
//                deferred.resolve(data);
//            })
//            .error(function (data, status, headers, config) {
//                deferred.reject(data);
//            });
//            return deferred.promise;
//        },
//        saveChanges: function (account) {
//            var deferred = $q.defer();

//            $http({ method: 'POST', url: '/UserManagement/save-group', params: { value: JSON.stringify(account) } })
//                .success(function (data, status, header, config) {
//                    deferred.resolve(data);
//                })
//                .error(function (data, status, headers, config) {
//                    deferred.reject(data);
//                });
//            return deferred.promise;
//        },
//        addNewGroup: function () {
//            var deferred = $q.defer();

//            $http({ method: 'GET', url: '/UserManagement/groupInfo', params: { value: JSON.stringify(account) } })
//                .success(function (data, status, header, config) {
//                    deferred.resolve(data);
//                })
//                .error(function (data, status, headers, config) {
//                    deferred.reject(data);
//                });
//            return deferred.promise;
//        },
//        deleteGroup: function (account) {
//            var deferred = $q.defer();

//            $http({ method: 'POST', url: '/UserManagement/delete-group', params: { value: JSON.stringify(account) } })
//                .success(function (data, status, header, config) {
//                    deferred.resolve(data);
//                })
//                .error(function (data, status, headers, config) {
//                    deferred.reject(data);
//                });
//            return deferred.promise;
//        },
//    }

//}]);