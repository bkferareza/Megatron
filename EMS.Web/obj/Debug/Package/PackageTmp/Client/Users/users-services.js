'use strict';
usersModule.factory('usersFactory', ['$http', '$q', '$upload', function ($http, $q, $upload) {

    return {
        login: function (account) {
            var deferred = $q.defer();

            $http({ method: 'POST', url: '/Login', params: { value: JSON.stringify(account) } })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
            return deferred.promise;
        },
        getUserInfo: function (account) {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/UserManagement/userInfo', params: { value: JSON.stringify(account) } })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
            return deferred.promise;
        },
        getUserTree: function (account) {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/UserManagement/user-tree', params: { value: JSON.stringify(account) } })
            .success(function (data, status, header, config) {
                //console.log(data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        usernameCheck: function (account) {
            var deferred = $q.defer();

            $http({ method: 'POST', url: '/UserManagement/username-exist', params: { value: JSON.stringify(account) } })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
            return deferred.promise;
        },
        emailCheck: function (account) {
            var deferred = $q.defer();

            $http({ method: 'POST', url: '/UserManagement/email-exist', params: { value: JSON.stringify(account) } })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
            return deferred.promise;
        },
        saveChanges: function (account) {
            var deferred = $q.defer();

            $http({ method: 'POST', url: '/UserManagement/save-user', params: { value: JSON.stringify(account) } })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
            return deferred.promise;
        },
        addNewUser: function () {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/UserManagement/add-user' })
            .success(function (data, status, header, config) {
                console.log(data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        deleteUser: function (account) {
            var deferred = $q.defer();

            $http({ method: 'POST', url: '/UserManagement/delete-user', params: { value: JSON.stringify(account) } })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
            return deferred.promise;
        },
        resetPassword: function (account) {
            var deferred = $q.defer();

            $http({ method: 'POST', url: '/UserManagement/reset-password', params: { value: JSON.stringify(account) } })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
            return deferred.promise;
        },
        forgotPassword: function (account) {
            var deferred = $q.defer();

            $http({ method: 'POST', url: '/Login/forgot-password', params: { value: account } })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
            return deferred.promise;
        },
        uploadLogo: function (file, userId) {
            return $upload.upload({ url: '/api/misc/uploadLogo?userId=' + userId, file: file });
        },
        uploadBackground: function (file, userId) {
            return $upload.upload({ url: '/api/misc/uploadBackground?userId=' + userId, file: file });
        },
        changePassword: function (account) {
            var deferred = $q.defer();

            $http({ method: 'POST', url: '/Login/change-password', params: { value: JSON.stringify(account) } })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
            return deferred.promise;
        },
        getGroupsOfUser: function (account) {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/UserManagement/groupsOfUser', params: { value: JSON.stringify(account) } })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
            return deferred.promise;
        },
        getVariableTree: function (userId) {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/UserManagement/variabletree-with-access', params: { value: JSON.stringify(userId) } })
            .success(function (data, status, header, config) {
                console.log(data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
    }

}]);