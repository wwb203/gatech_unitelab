(function() {
  'use strict';
  angular
    .module('thinkster.specs.controllers')
    .controller('SpecsController', SpecsController);
  SpecsController.$inject = ['$timeout','$location','$scope','Specs','$q','$mdToast'];
  function SpecsController($timeout,$location,$scope,Specs,$q,$mdToast) {
    var vm = this;
    vm.typeId = $scope.specs.id;
    console.log('starting SpecsController',vm.typeId);
    vm.specs = $scope.specs.specs;
    vm.spec = Specs.getSelect(vm.typeId);
    if(vm.spec == null) {
      vm.spec = [];
      for(let i = 0; i< vm.specs.length;i++) {
        vm.spec[i] =
          {specId:vm.specs[i].id,
            specName:vm.specs[i].name,
            paraType:vm.specs[i].paraType,
            selection:{id:-1,name:'Any'},
            paraId:getParameterId(vm.specs[i]),
            paraList:vm.specs[i].parameter,
            disabled: true}
      }
    }

    function getParameterId(specs) {
       // console.log(specs);
      if(specs.paraType=='enum') {
        return 0;
      } else {
        let list = specs.parameter;
          for(let i = 0; i < list.length; i++) {
              if(list.id == 1) return list.name;
          }
          return 0;
      }
    }
    $scope.$on("toggleAnimation", function (event, args) {
      if(args == $scope.specs.id){
        console.log("received broadcast",args);
          vm.sendSearchField();
      }
    });
    vm.showSearchField =function() {
      //console.log(JSON.stringify(vm.spec));
      //Specs.search(JSON.stringify(vm.spec));
    };
    vm.sendSearchField = function() {
      let result={typeID:$scope.specs.id,paraList:[]};
      for(let i = 0; i< vm.specs.length;i++) {
        let isdisabled = 'true';
        if(!vm.spec[i].disabled) {
          isdisabled = 'false';
        }
          if(vm.spec[i].paraType == 'enum') {
              for(let j = 0; j < vm.specs[i].parameter.length; j++) {
                  if(vm.specs[i].parameter[j].id == vm.spec[i].paraId) {
                      vm.spec[i].paraId = vm.specs[i].parameter[j].name;
                      break;
                  }
              }
          }
        result.paraList[i] = {
          specID:vm.spec[i].specId,
          //paraType: vm.spec[i].paraType,
          value: vm.spec[i].paraId,
          disabled: isdisabled
        }
      }
      Specs.putSelect(vm.spec,vm.typeId);
        Specs.search(result).then(SuccessFn, ErrorFn);
        function SuccessFn(response) {
            let data = response.data;
            if(data.status == 'Success' && data.equipList.length > 0) {
                console.log(data.equipList);
                Specs.putSearch(data.equipList);
                Specs.jumpToEquipList();
            } else {
                if(data.equipList.length == 0) {

                $mdToast.show($mdToast.simple().textContent('No Matching Device'));
                }
                else {
                $mdToast.show($mdToast.simple().textContent(data.message));
                }
            }
            return;

        }
        function ErrorFn(response) {
            return;

        }
    }
  }
})();
