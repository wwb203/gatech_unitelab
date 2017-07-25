(function () {
  'use strict';
  angular
    .module('thinkster.specs.directives')
    .directive('spec',spec);
  function spec() {
    var directive = {
      controller: 'SpecController',
      controllerAs: 'vm',
      restrict: 'E',
      scope: {
        spec: '=',
        callback:'&'
      },
      templateUrl: '/static/templates/specs/spec.html',
    };
    return directive;
  }
})();
