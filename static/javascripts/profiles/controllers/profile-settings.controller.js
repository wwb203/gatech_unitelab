(function () {
  'use strict';
  angular
    .module('thinkster.profiles.controllers')
    .controller('ProfileSettingsController', ProfileSettingsController)
    .filter('propsFilter', function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      var keys = Object.keys(props);

      items.forEach(function(item) {
        var itemMatches = false;

        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  };
});
  ProfileSettingsController.$inject = [
    '$location', '$routeParams', 'Authentication', 'Profile','$mdToast','$interval'];
  function ProfileSettingsController($location, $routeParams, Authentication, Profile,$mdToast,$interval) {
    var vm = this;
    vm.destroy = destroy;
    vm.update = update;
    vm.is_boss = false;
      activate();
    function activate() {
        console.log("ProfileSettingsController");
      var authenticatedAccount = Authentication.getAuthenticatedAccount();
      var username = $routeParams.username.substr(1);
      if(!authenticatedAccount) {
        $location.url('/');
           $mdToast.show($mdToast.simple().textContent('You are not authorized'));
      } else {
        if(authenticatedAccount.username !== username) {
          $location.url('/');
            $mdToast.show($mdToast.simple().textContent('You are not authorized'));
        }
      }
        let AccountInfo = Authentication.getAccountInfo();
        if(AccountInfo) {
            vm.is_boss = (AccountInfo.userType=="Boss");
        }
      Profile.get(username).then(profileSucessFn, profileErrorFn);
      function profileSucessFn(data, status, headers, config) {
       vm.profile = data.data;
      }
      function profileErrorFn(data, status, headers, config) {
       $location.url('/');
        $mdToast.show($mdToast.simple().textContent('User not exist.'));
      }
  }
  function destroy() {
    Profile.destroy(vm.profile.username).then(profileSucessFn, profileErrorFn);
    function profileSucessFn(data, status, headers, config) {
      Authentication.unauthenticate();
      window.location = '/';
    }
    function profileErrorFn(data, status, headers, config) {
    $mdToast.show($mdToast.simple().textContent(data.data));

    }
  }
  function update() {
    Profile.update(vm.profile).then(profileSucessFn, profileErrorFn);
    function profileSucessFn(data, status, headers, config) {
        $mdToast.show($mdToast.simple().textContent('Profile updated.'));
    }
    function profileErrorFn(data, status, headers, config) {
 $mdToast.show($mdToast.simple().textContent(data.error));
    }
  }
  }
})();
