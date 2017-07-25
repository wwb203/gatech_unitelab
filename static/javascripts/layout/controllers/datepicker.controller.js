(function () {
    'use strict';
    angular
        .module('thinkster.layout.controllers')
        .controller('DatepickerDemoCtrl', DatepickerDemoCtrl);
    DatepickerDemoCtrl.$inject =['$log','$scope','$timeout','CalService'];
    function DatepickerDemoCtrl($log,$scope,$timeout,CalService) {

        $scope.update = function() {
            $scope.updateEvent();
            $scope.ngDialog.close();
        };
        $scope.create = function() {
            $scope.addEvent();
            $scope.ngDialog.close();
        };
        $scope.cancel = function() {
            $scope.ngDialog.close();
        }
        $scope.delete = function() {
            $scope.removeEvent();
            $scope.ngDialog.close();
        }

        $scope.changed = function () {
        };
    }
})();
