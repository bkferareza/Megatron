var discussionsModule = angular.module('discussionsModule', ['ngRoute', 'ngResource','angularFileUpload'])
.config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
});

'use strict'
discussionsModule.factory('discussionsFactory', ['$http', '$q','$upload', function ($http, $q, $upload) {
    return {
        getChartsForDiscussionBoard: function (userID) {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/api/discussion/getCharts', params: { value: JSON.stringify(userID) } })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });
            return deferred.promise;
        },
        saveChanges: function (entity) {
            var deferred = $q.defer();

            $http({ method: 'POST', url: '/api/discussion/savechanges', params: { value: JSON.stringify(entity) } })
            .success(function (data, status, header, config) {
                console.log(data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        getDiscussionBoard: function (userchartID) {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/api/discussion/getDiscussion', params: { value: JSON.stringify(userchartID) } })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                });

            return deferred.promise;
        },

        getDiscussionMessages: function (discussionID) {
        var deferred = $q.defer();

            $http({ method: 'GET', url: '/api/discussion/getDiscussionMessage', params: { value: JSON.stringify(discussionID) } })
            .success(function (data, status, header, config) {
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });

            return deferred.promise;
        },

        getMessageAuthor: function (userID) {
            var deferred = $q.defer();

            $http({ method: 'GET', url: '/api/discussion/getUserInfo', params: { value: JSON.stringify(userID) } })
            .success(function (data, status, header, config) {
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });

            return deferred.promise;
        },
        uploadAttachment: function(file,messageId)
        {
            return $upload.upload({ url: '/api/discussion/uploadAttachment?messageID=' + messageId, file: file });
        },
        
        downloadAttachment: function(attachment)
        {
            window.open('/api/discussion/getAttachment?filename=' + attachment, '_self');

        }

    }
}]);