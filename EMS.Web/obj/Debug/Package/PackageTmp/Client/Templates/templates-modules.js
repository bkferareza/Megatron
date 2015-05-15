var templateModule = angular.module('templateModule', ['ngRoute', 'ngResource', 'chartModule', 'datapointModule'])
.config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.when('/templates/manage',
        {
            controller: 'templateController',
            templateUrl: '/TemplateManagement/Index'
        });
})