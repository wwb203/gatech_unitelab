(function () {
    'use strict';
    angular
        .module('thinkster.specs.controllers')
        .controller('SpecsIndexController', SpecsIndexController);
    SpecsIndexController.$inject = ['$timeout','$scope', 'Authentication', 'Specs'];
    function SpecsIndexController($timeout,$scope, Authentication, Specs) {
        $scope.oneAtATime = true;


        $scope.status = {
            isCustomHeaderOpen: false,
            isFirstOpen: true,
            isFirstDisabled: false
        };

        var vm = this;
        vm.isAuthenticated = Authentication.isAuthenticated();
        vm.library=[];
        activate();
        function activate(){
            Specs.get().then(SuccessFn, ErrorFn);
            function SuccessFn(data, status, headers, config) {
                let response = data.data;
                if(response.status=='Success') {
                    vm.library = response.Library;
                    console.log(vm.library);
                } else {
                    $mdToast.show($mdToast.simple().textContent(response.message));
                }
            }
            function ErrorFn(data, status, headers, config) {
                console.log('Fail to get equipment list');
                $mdToast.show($mdToast.simple().textContent(data.error));
            }

        }
        vm.search = function(index) {
            console.log("submit search loop index:"+vm.library[index].id);
            $scope.$broadcast("toggleAnimation", vm.library[index].id);
        }
    }
})();
