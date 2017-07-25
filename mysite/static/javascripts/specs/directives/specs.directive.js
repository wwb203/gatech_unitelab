(function () {
  'use strict';
  angular
    .module('thinkster.specs.directives')
    .directive('specs',specs);
  function specs() {
    var directive = {
      controller: 'SpecsController',
      controllerAs: 'vm',
      restrict: 'E',
      scope: {
        specs: '='
      },
      templateUrl: '/static/templates/specs/specs.html'
    };
    return directive;
  }
})();
