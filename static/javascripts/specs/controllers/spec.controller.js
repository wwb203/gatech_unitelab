(function() {
  'use strict';
  angular
    .module('thinkster.specs.controllers')
    .controller('SpecController', SpecController);
  SpecController.$inject = ['$timeout','$scope','$http'];
  function SpecController($timeout,$scope,$http) {
    var vm = this;
    if(angular.isUndefined($scope.spec.selection))
    {
      vm.selectedParameter = {id:-1, name:'Any'};
    } else {
    vm.selectedParameter = {id:$scope.spec.selection['id'], name:$scope.spec.selection['name']};
    }
    //vm.specSelection = {id:-1, name:'Any'};
    /*if(!$scope.spec.disabled && $scope.spec.selection.hasOwnProperty('name')) {
      $scope.specSelection = $scope.spec.selection;
    } else {
      $scope.specSelection = {id:-1, name:'Any'};
    }
    angular.element(document).ready(function () {
       $timeout(function () {
        $scope.$broadcast('rzSliderForceRender');
    },170);
    });*/

    vm.update = function() {
      $scope.spec.selection=vm.selectedParameter;
      $scope.callback();
    };

      $timeout(function () {
          for (let i = 0; i < $scope.spec.paraList.length;i++) {
              if($scope.spec.paraList[i].id == 1) {
                  $scope.minValue = $scope.spec.paraList[i].name;
              }else {
                  $scope.maxValue = $scope.spec.paraList[i].name;
              }
          }
      })
      $scope.disabled_slider = {
      value: $scope.spec.paraId,
      options: {
        ceil: $scope.maxValue,
        floor: $scope.minValue,
        disabled: $scope.spec.disabled,
      }
    };
    vm.parameters = $scope.spec.paraList;
    function findSpec(item) {
      return item.id == $scope.spec.paraId;
    }
}})();
