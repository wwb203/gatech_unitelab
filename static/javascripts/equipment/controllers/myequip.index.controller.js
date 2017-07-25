(function() {
    'use strict';
    angular
        .module('thinkster.equipment.controllers')
        .controller('MyEquipIndexController',MyEquipIndexController);
    MyEquipIndexController.$inject= ['$location','$scope', 'Authentication','Specs','$mdToast'];
    function MyEquipIndexController($location,$scope, Authentication, Specs,$mdToast) {
        var vm = this;
        vm.equipList = [];//Specs.getMyQuery();
        activate();
        function activate() {
            var authenticatedAccount = Authentication.getAuthenticatedAccount();
            if(!authenticatedAccount) {
                $location.url('/');
                $mdToast.show($mdToast.simple().textContent('You are not authorized'));
            }
            Specs.getMyQuery().then(SuccessFn, ErrorFn);
            function SuccessFn(data, status, headers, config) {
                let response = data.data;
                if(response.status=='Success') {
                    vm.equipList = response.equipList;
                    console.log(vm.equipList);
                } else {
                    $mdToast.show($mdToast.simple().textContent(response.message));
                }
            }
            function ErrorFn(data, status, headers, config) {
                console.log('PendingList Error');
                $mdToast.show($mdToast.simple().textContent(data.error));
            }


        }

        vm.listIsEmpty = true;
        if(vm.equipList.length>0) {
            vm.listIsEmpty==false;
        }
        vm.info = Authentication.getAccountInfo();
        vm.back = function() {
            $location.url('/myCalendar');
        }
        vm.select = function(equip) {
            console.log(equip);
            Specs.putDetail(equip);
            Specs.putBackUrl('/mylabequiplist');
            $location.url('/equipmentdetail');
        }

    };


})();
