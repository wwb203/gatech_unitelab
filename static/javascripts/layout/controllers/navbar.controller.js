(function () {
    'use strict';
    angular
        .module('thinkster.layout.controllers')
        .controller('NavbarController', NavbarController);
    NavbarController.$inject = ['$scope', 'Authentication','$interval'];
    function NavbarController($scope, Authentication,$interval) {
        var vm = this;
        vm.logout = logout;
        vm.isNavCollapsed = true

        function updatepermission() {
            let info = Authentication.getAccountInfo();
            console.log(info);
            if(info) {
                $scope.has_access = !info['lab_pending'];
                $scope.is_boss = info['userType'] == 'Boss';
                console.log($scope.has_access);
                console.log($scope.is_boss);
            }
        }
        function logout() {
                Authentication.logout();
            }

        $(document).ready(function () {
            $(document).click(function (event) {
                var clickover = $(event.target);
                var _opened = $(".navbar-collapse").hasClass("navbar-collapse in");
                if (_opened === true && !clickover.hasClass("navbar-toggle")) {
                    $("button.navbar-toggle").click();
                }
            });
        });
        $(document).click(function (event) {
            var clickover = $(event.target);
            var $navbar = $(".navbar-collapse");
            var _opened = $navbar.hasClass("in");
            if (_opened === true && !clickover.hasClass("navbar-toggle")) {
                $navbar.collapse('hide');
            }


        });
    }
})();

