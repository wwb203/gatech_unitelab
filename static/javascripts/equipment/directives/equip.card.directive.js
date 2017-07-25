(function () {
  'use strict';
  angular
    .module('thinkster.equipment.directives')
    .directive('equipcard',equipcard);
  function equipcard() {
    var directive = {
      controller: 'EquipCardController',
      controllerAs: 'vm',
      restrict: 'E',
      scope: {
        equip: '=',
      },
      templateUrl: '/static/templates/equipment/card.html',
    };
    return directive;
  }
})();
