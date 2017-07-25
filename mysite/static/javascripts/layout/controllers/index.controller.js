(function () {
  'use strict';
  angular
    .module('thinkster.layout.controllers')
    .controller('IndexController', IndexController);
  IndexController.$inject =['$scope', 'Authentication', 'Posts'];
  function IndexController($scope, Authentication, Posts) {
    var vm = this;
    vm.isAuthenticated = Authentication.isAuthenticated();
    vm.posts = [];
    vm.time = undefined;
        vm.priceSlider = {
        value: 200,
        options: {
            floor: 0,
            ceil: 500
        }
    }
  }
})();
