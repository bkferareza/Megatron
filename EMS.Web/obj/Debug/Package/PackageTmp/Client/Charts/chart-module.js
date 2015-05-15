var chartModule = angular.module('chartModule', ['ngRoute', 'ngResource'])
.config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.when('/charts/wizard',
        {
            controller: 'chartController',
            templateUrl: '/Client/Charts/template/chart-template.html'
        });
});

