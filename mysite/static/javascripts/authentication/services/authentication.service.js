(function () {
    'use strict';

    angular
        .module('thinkster.authentication.services')
        .factory('Authentication', Authentication);
    Authentication.$inject = ['$cookies','$http','$mdToast'];

    function Authentication($cookies,$http,$mdToast) {
        var username = '';

        var Authentication = {
            getusername:getusername,
            getAuthenticatedAccount: getAuthenticatedAccount,
            getAccountInfo: getAccountInfo,
            setAccountInfo: setAccountInfo,
            isAuthenticated: isAuthenticated,
            setAuthenticatedAccount: setAuthenticatedAccount,
            unanthenticated: unanthenticated,
            login: login,
            logout: logout,
            register: register
        };
        return Authentication;
        function getusername() {
            return username;
        }
        function getAccountInfo() {
            if(!$cookies.get('accountInfo')) {
                return;
            }
            return JSON.parse($cookies.get('accountInfo'));
        }
        function setAccountInfo(info) {
            console.log(JSON.stringify(info));
            $cookies.put('accountInfo',JSON.stringify(info));
        }

        function getAuthenticatedAccount() {
            if(!$cookies.get('account')) {
                return;
            }
            return JSON.parse($cookies.get('account'));
        }
        function unanthenticated() {
            $cookies.remove('account');
            $cookies.remove('accountInfo');
        }
        function isAuthenticated() {
            if($cookies.get('account')) {
                return true;
            }
            return false;
        }
        function setAuthenticatedAccount(account) {
            console.log('setAuthenticatedAccount');
            $cookies.put('account', JSON.stringify(account));
                $http.get('/AccountInfo/').then(function(request){
                    console.log('loged'+JSON.stringify(request.data.data));
                    Authentication.setAccountInfo(request.data.data);
                },function () {
                    $mdToast.show($mdToast.simple().textContent('unable to fetch AccountInfo'));
                })
                $mdToast.show($mdToast.simple().textContent('Login Success'));
        }

        function login(email, password) {
            return $http.post('/api/v1/auth/login/', {
                email:email,
                password:password
            }).then(function (request) {
                console.log(request.data);
                Authentication.setAuthenticatedAccount(request.data);
                window.location ='/';
            }, loginErrorFn);
            function loginSuccessFn(data, status, headers, config) {
                console.log('loginSuccess');
                console.log(data.data);
                username = data.data.username;
                Authentication.setAuthenticatedAccount(data.data);

            }
            function loginErrorFn(request) {
                $mdToast.show($mdToast.simple().textContent('Login Error'));
                console.log('loginError');
            }
        }
        function logout() {
            return $http.post('/api/v1/auth/logout/').then(logoutSuccessFn, logoutErrorFn);
            function logoutSuccessFn(data, status, headers, config) {
                Authentication.unanthenticated();
                window.location ='/';

            }
            function logoutErrorFn(data, status, headers, config) {
                console.log('logout error');
            }
        }
        function register(email, password, username) {
            console.log("service register" + email)
            return $http.post('/api/v1/accounts/', {
                username: username,
                password: password,
                email: email
            }).then(registerSuccessFn, registerErrorFn);
            function registerSuccessFn(data, status, headers, config) {
                console.log('register succeed'+ ' '+ email)
                Authentication.login(email, password);
            }
            function registerErrorFn(data, status, headers, config) {
                console.log('Epic failure!');
            }


        }
    }
})();
