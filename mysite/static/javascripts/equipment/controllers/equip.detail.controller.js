(function() {
  'use strict';
  angular
    .module('thinkster.equipment.controllers')
    .controller('EquipDetailController', EquipDetailController);
  EquipDetailController.$inject = ['$window','$location','$scope','$http','Specs','CalService'];
  function EquipDetailController($window,$location,$scope,$http,Specs,CalService) {
    var vm = this;
    vm.equip = Specs.renderDetail();
    vm.back = function() {
      $location.url(Specs.getBackUrl());
    }
      vm.calendar = function() {
          let meta = {equipID:vm.equip.id};
          CalService.setMeta(meta);
          console.log('switching to calendar,equipID', vm.equip.id);
          CalService.setBackUrl('/equipmentdetail');
          $location.url('/calendar');
      }
    vm.redirectToManu = function() {
      $window.open(vm.equip.linkurl, '_blank');
    }
  }
})();
