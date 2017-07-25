(function() {
  'use strict';
  angular
    .module('thinkster.equipment.controllers')
    .controller('EquipCardController', EquipCardController);
  EquipCardController.$inject = ['$location','$scope','$http','Specs'];
  function EquipCardController($location,$scope,$http,Specs) {
    var vm = this;
    console.log(JSON.stringify($scope.equip));
    vm.reportEquipment= function(equipId) {
      console.log(equipId);
    }
    vm.select = function() {
      console.log('card select equipId:'+ $scope.equip.id);
      Specs.getDetail($scope.equip.id);
      $location.url('/equipmentdetail');
    }

  }
})();
