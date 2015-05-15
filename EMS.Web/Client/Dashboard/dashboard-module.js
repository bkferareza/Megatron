var dashboardModule = angular.module('dashboardModule', ['ngRoute', 'ngResource'])
.config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
    $routeProvider.when('/dashboard',
        {
            controller: 'dashboardController',
            templateUrl: '/Dashboard/Index'
        });
})