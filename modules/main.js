﻿angular.module('main', ['ngRoute', 'core', 'elastic'])
  .controller('adminCtrl', AdminCtrl)
  .controller('mainCtrl', MainCtrl)
  .config(function ($routeProvider) {
    $routeProvider.when('/query', {
      templateUrl: 'views/query.html'
    });
    $routeProvider.when('/kibana', {
      templateUrl: 'views/kibana.html'
    });
    $routeProvider.when('/facetview', {
        templateUrl: '../facetview/index.html'
      //templateUrl: 'views/facetview.html',
      //controller: 'facetviewCtrl'
    });
    $routeProvider.otherwise({
      templateUrl: 'views/main.html',
    });
  });

function AdminCtrl($scope, currentSpot) {
    var isDebug = true;

  $scope.isDebug = isDebug;
  $scope.isActive = isActive;
  $scope.getTitle = getTitle;
  $scope.getActiveMenu = getActiveMenu;

  function isActive(menuId) {
    return currentSpot.getActiveMenu() == menuId;
  }

  function getTitle() {
    return currentSpot.getTitle();
  }

  function getActiveMenu() {
    return currentSpot.getActiveMenu();
  }
}

function MainCtrl(currentSpot) {
}
