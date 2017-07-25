(function () {
    'use strict';
    angular
        .module('thinkster.layout.controllers')
        .controller('TimepickerCtrl', TimepickerCtrl);
    TimepickerCtrl.$inject =['$scope','$mdDialog','event'];
    function TimepickerCtrl($scope,mdDialog,event) {
        console.log(e)
        $scope.hide = function() {
            $mdDialog.hide();
        };
        $scope.cancel = function() {
            $mdDialog.canel();
        }

        $scope.update = function() {
            scope.updateEvent();
        };
        $scope.create = function(event) {
            $mdDialog.hide(event);
        };
        /*$scope.cancel = function() {
            $scope.ngDialog.close();
        }*/
        $scope.delete = function() {
            $scope.removeEvent();
        }

        $scope.changed = function () {
        };
    }
})();
