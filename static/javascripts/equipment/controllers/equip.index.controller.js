(function() {
    'use strict';
    angular
        .module('thinkster.equipment.controllers')
        .controller('EquipIndexController',EquipIndexController);
    EquipIndexController.$inject= ['$location','$scope', 'Authentication','Specs'];
    function EquipIndexController($location,$scope, Authentication, Specs) {
        var vm = this;
        vm.equipList = Specs.getQuery();
        vm.listIsEmpty = true;
        if(vm.equipList.length>0) {
            vm.listIsEmpty==false;
        }
        console.log(JSON.stringify(vm.equipList));
        vm.back = function() {
            $location.url('/specs');
        }
        vm.select = function(equip) {
            console.log(equip);
            Specs.putDetail(equip);
            Specs.putBackUrl('equipmentlist');
            $location.url('/equipmentdetail');
        }
    };
})();
