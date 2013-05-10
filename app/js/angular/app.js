'use strict';


// Declare app level module which depends on filters, and services
var btApp = angular.module('btApp', ['btApp.filters', 'btApp.services', 'btApp.directives', 'btApp.controllers']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/home', {templateUrl: 'partials/home.html', controller: 'MyCtrl1'});
    $routeProvider.when('/tree1', {templateUrl: 'partials/modis.html', controller: 'MyCtrl1'});
    $routeProvider.when('/tree2', {templateUrl: 'partials/radarsat.html', controller: 'MyCtrl1'});
    $routeProvider.when('/tree3', {templateUrl: 'partials/eo1.html', controller: 'MyCtrl1'});
    $routeProvider.when('/tree4', {templateUrl: 'partials/testpar.html', controller: 'MyCtrl1'});
    $routeProvider.when('/test', {templateUrl: 'partials/test.html', controller: 'MyCtrl1'});
    $routeProvider.otherwise({redirectTo: '/home'});
  }]);
