(function () {
  'use strict';

  angular
    .module('thinkster', [
      'thinkster.config',
      'thinkster.routes',
      'thinkster.authentication',
      'thinkster.layout',
//      'thinkster.posts',
      'thinkster.profiles',
      'thinkster.calendar',
      'thinkster.specs',
      'thinkster.equipment',
        'thinkster.lab',
        'ngMaterial',
        'jkAngularRatingStars'
    ]).config(function($mdThemingProvider){
        $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
        $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
        $mdThemingProvider.theme('dark-purple').backgroundPalette('purple').dark();
        $mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();
    });
  angular
    .module('thinkster.routes', ['ngRoute']);
  angular
    .module('thinkster.config', []);
  angular
    .module('thinkster')
    .run(run);
  run.$inject = ['$http'];
  function run($http) {
    $http.defaults.xsrfHeaderName = 'X-CSRFToken';
    $http.defaults.xsrfCookieName = 'csrftoken';
  }
})();
