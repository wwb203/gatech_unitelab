(function () {
    'use strict';
    angular
        .module('thinkster.lab.controllers')
        .controller('LabIndexController', LabIndexController);
    LabIndexController.$inject = ['$timeout','$scope', 'Authentication', 'Specs','Labs','$element','$mdDialog','$mdToast','$routeParams'];
    function LabIndexController($timeout,$scope, Authentication, Specs,Labs,$element,$mdDialog,$mdToast,$routeParams) {
        var vm = this;
        var pendingIndex = -1;
        vm.manageList =[];
        vm.deviceTypeList= ["Microscope","Centrifuge","Incubator","Freezer"];
        $scope.oneAtATime = true;
        vm.pengingList = [];
        vm.memberList = [];
        vm.equipList = [];
        $scope.personToRemove = {};
        $scope.searchTerm;
        $scope.clearSearchTerm = function() {
            $scope.searchTerm = '';
        };
        $scope.clearEquipSearch = function(equip) {
            equip.searchTerm = '';
        }
        $scope.searchType;
        $scope.clearDeviceSearch = function() {
            $scope.searchType = '';
        }
        $scope.newItem = {email:'',device:'',username:''};
        // The md-select directive eats keydown events for some quick select
        // logic. Since we have a search input here, we don't need that logic.
        $element.find('input').on('keydown', function(ev) {
            ev.stopPropagation();
        });
        $scope.update = function() {
            for(let i = 0; i < vm.equipList.length; i++) {
                vm.equipList[i].managerList = vm.manageList[i];
                let idList = [];
                for(let j = 0; j < vm.manageList[i].length; j++) {
                    idList.push(vm.manageList[i][j].id);
                }
                vm.equipList[i].equipAuth = idList;
            }
            console.log(vm.equipList);
            Labs.updateMyDevice({equipList:vm.equipList}).then(SuccessFn, ErrorFn);
            function SuccessFn(data, status, headers, config) {
                $mdToast.show($mdToast.simple().textContent('Equipment Authentication Updated.'));
            }
            function ErrorFn(data, status, headers, config) {
                $mdToast.show($mdToast.simple().textContent(data.error));
            }

        }
        $scope.isManager = function(person, managerList) {
            for(let i = 0; i < managerList.length; i++) {
                if(person['id'] == managerList[i]['id']){
                    return true;
                }
            }
            return false;
        }

        activate();
        function activate(){
            var authenticatedAccount = Authentication.getAuthenticatedAccount();
            if(!authenticatedAccount) {
                $location.url('/');
                $mdToast.show($mdToast.simple().textContent('You are not authorized'));
            }

            Labs.getPendingList().then(getPendingListSuccessFn, getPendingListErrorFn);
            Labs.getMyLabMemberDevice().then(getMemberDeviceSuccessFn, getMemberDeviceErrorFn);
            for(let i = 0; i < vm.equipList.length; i++) {
                vm.equipList[i]['searchTerm'] = '';
            }
            function getPendingListSuccessFn(data, status, headers, config) {
                let response = data.data;
                if(response.status=='Success') {
                    vm.pendingList = response.studentList;
                    console.log(vm.pendingList);
                } else {
                    $mdToast.show($mdToast.simple().textContent(response.message));
                }
            }
            function getPendingListErrorFn(data, status, headers, config) {
                console.log('PendingList Error');
                $mdToast.show($mdToast.simple().textContent(data.error));
            }
            function getMemberDeviceSuccessFn(data, status, headers, config) {
                let response = data.data;
                if(response.status=='Success') {
                    vm.memberList =response.studentList;
                    vm.equipList = response.equipList;
                    for(let i = 0; i< vm.memberList.length; i++) {
                        vm.memberList[i]['fullName'] =
                            vm.memberList[i]['firstName'].charAt(0)
                            + '. '+vm.memberList[i]['lastName'];
                    }
                    for(let i = vm.memberList.length - 1; i >= 0; i--) {
                        if(vm.memberList[i].lab_pending) {
                            vm.memberList.splice(i,1);
                        }
                    }
                    for(let i = 0; i < vm.equipList.length; i++) {
                        let equip = vm.equipList[i];
                        let authList = equip['equipAuth'];
                        let managerList = [];
                        for( let j = 0; j < authList.length;j++){
                            for(let k = 0; k < vm.memberList.length; k++) {
                                let student = vm.memberList[k];
                                if(student['id'] == authList[j]) {
                                    managerList.push(student);
                                }
                            }
                        }
                        equip['managerList'] = managerList;
                    }

                    console.log(vm.memberList);
                    console.log(vm.equipList);

                } else {
                    $mdToast.show($mdToast.simple().textContent(response.message));
                }
            }
            function getMemberDeviceErrorFn(data, status, headers, config) {
                console.log('DeviceList error');
                $mdToast.show($mdToast.simple().textContent(data.error));
            }

        }
        vm.accept = function(index) {
            pendingIndex = index;
            Labs.updatePendingList(vm.pendingList[index].id,"TRUE").then(
                updatePendingSuccessFn,ErrorFn
            );
            function ErrorFn(data, status, headers, config) {
                $mdToast.show($mdToast.simple().textContent(data.error));
            }

        }
        function updatePendingSuccessFn(data, status, headers, config) {
            $mdToast.show($mdToast.simple().textContent('Student Added.'));
            vm.pendingList.splice(pendingIndex,1);
            activate();
        }

        vm.decline = function(index) {
            var i = index;
            Labs.updatePendingList($scope.pendingList[index].id,"FALSE").then(
                SuccessFn,ErrorFn
            );
            function SuccessFn(data, status, headers, config) {
                $mdToast.show($mdToast.simple().textContent('Student Rejected.'));
                activate();
            }
            function ErrorFn(data, status, headers, config) {
                $mdToast.show($mdToast.simple().textContent(data.error));
            }
        }
        vm.remove = function() {
            console.log($scope.personToRemove);
        }
        vm.ShowAddDialog = function () {
            $mdDialog.show({
                controller:addDialogController,
                templateUrl:'/static/templates/lab/modal_add.html',
                clickOutsideToClose:true,
                locals: {
                    item: $scope.newItem
                }
            }).then(function(item) {
                console.log(item);
            },function() {console.log('dialog cancelled')});
        };
        function addDialogController($scope, $mdDialog, item) {
            $scope.item = item;
            $scope.add = function() {
                $mdDialog.hide(item);
            }
            $scope.cancel = function() {
                $mdDialog.cancel();
            }
        }

    }
})();
