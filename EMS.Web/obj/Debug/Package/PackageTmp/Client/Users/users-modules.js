
var usersModule = angular.module('usersModule', ['ngRoute', 'ngResource', 'ui.tree', 'angularFileUpload'])
.config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    //$routeProvider.when('/accounts/manage',
    //    {
    //        controller: 'accountsController',
    //        templateUrl: '/Client/Accounts/Templates/account-create.html'
    //    });

    $routeProvider.otherwise(
    {
        controller: 'loginController',
        templateUrl: '/Login/Index'
    });

    $routeProvider.when('/users/manage',
    {
        controller: 'usersController',
        templateUrl: '/UserManagement/Index'
    });
})