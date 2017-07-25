(function() {
    'use strict';
    angular
        .module('thinkster.specs.services')
        .service('Specs', Specs);
    Specs.$inject = ['$http','$location'];
    function Specs($http,$location) {
        var Specs = {
            get: get,
            putSelect: putSelect,
            getSelect: getSelect,
            search: search,
            jumpToEquipList: jumpToEquipList,
            putSearch: putSearch,
            getQuery: getQuery,
            getMyQuery:getMyQuery,
            putDetail: putDetail,
            renderDetail: renderDetail,
            putBackUrl: putBackUrl,
            getBackUrl: getBackUrl,
        }
        var library=[];
        var specSelect= {};
        var searchResult = [];
        var equipDetail = [];
        var backUrl = '/';
        return Specs;
        function putBackUrl(url) {
            backUrl = url;
        }
        function getBackUrl() {
            let url = backUrl;
            backUrl = '/';
            return url;
        }
        function putDetail(equip) {
            equipDetail = equip;

        };
        function renderDetail() {
            console.log('renderDetail');
            return equipDetail;
        }
        function getSelect(typeId) {
            return specSelect[typeId];
        }
        function putSelect(selection,typeId) {
            specSelect[typeId] = selection;
        }
        function getQuery(){
            return searchResult;
        };
        function putSearch(content) {
            searchResult = content;
        }
        function getMyQuery() {
            return($http.get('/GroupEquipList/'));
        }
        function get() {
            return($http.get('/EquipTypeList/'));
        }
        function jumpToEquipList() {
            $location.url('/equipmentlist');
        }
        function search(content) {
            searchResult = [];
            console.log('going to search');
            console.log(content);
            return($http.post('/EquipSearch/',JSON.stringify(content)));
        }
    }
})();
