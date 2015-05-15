var datapointModule = angular.module('datapointModule', ['ngRoute', 'ngResource', 'angularFileUpload'])
.config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.when('/datapoints/manage',
        {
            controller: 'datapointController',
            templateUrl: '/DataPointManagement/Index'
        });
})

var editFolder = function () {

    var controller = function ($scope) {

    }

    controller.$inject = ['$scope'];

    return {
        restrict: 'E',
        scope: {
            item: '=item'
        },
        controller: controller,
        templateUrl: 'Client/DataPoints/Directives/editFolder.html'
    }
}



datapointModule.directive('editFolder', editFolder);