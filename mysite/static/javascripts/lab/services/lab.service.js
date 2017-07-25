(function() {
    'use strict';
    angular
        .module('thinkster.lab.services')
        .service('Labs', Labs);
    Labs.$inject = ['$http'];
    function Labs($http) {
        var Labs = {
            getPendingList:getPendingList,
            getMyLabMemberDevice:getMyLabMemberDevice,
            queryServer:queryServer,
            updatePendingList:updatePendingList,
            updateMyDevice:updateMyDevice
        }
        var studentList=[];
        var equipList=[];
        var pendingList=[];
        return Labs;
        function queryServer() {
        }
        function getMyDevice() {
            console.log('getMyDevice');
            queryServer();
            return equipList;
        }
        function getPendingList() {
            return($http.get('/LabApplicantList/'));
        }
        function getMyLabMemberDevice() {
            return($http.get('/AuthList/'));

        }
        function updatePendingList(studentid, approved) {
            return($http.post('/LabDealApplicantID/',JSON.stringify({id:studentid, approve:approved})));
        }
        function updateMyDevice(equipList){
            return($http.post('/AuthUpdate/',JSON.stringify(equipList)));
        }
    }
})();
