(function () {
  'use strict';

  angular
    .module('thinkster.routes')
    .config(config);
  config.$inject = ['$routeProvider'];

  function config($routeProvider) {
      $routeProvider.when('/',{
          templateUrl:'/static/templates/layout/index.html'
      }).when('/myCalendar',{
      templateUrl: '/static/templates/layout/myindex.html'
    }).when('/calendar', {
      templateUrl: '/static/templates/calendar/index.html'
    }).when('/specs', {
      controller: 'SpecsIndexController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/specs/index.html'
    }).when('/equipmentlist', {
      controller: 'EquipIndexController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/equipment/equipmentlist.html'
    }).when('/mylabequiplist', {
        controller: 'MyEquipIndexController',
        controllerAs: 'vm',
        templateUrl: '/static/templates/equipment/mylabequiplist.html'
    }).when('/equipmentdetail', {
      controller: 'EquipDetailController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/equipment/equipmentdetail.html'
    }).when('/manage', {
        templateUrl:'/static/templates/lab/index.html'
    }).when('/register', {
      controller: 'RegisterController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/authentication/register.html'
    }).when('/login', {
      controller: 'LoginController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/authentication/login.html'
    }).when('/+:username/settings', {
      controller: 'ProfileSettingsController',
      controllerAs: 'vm',
      templateUrl: '/static/templates/profiles/settings.html'
    }).otherwise('/');
    }
})();
