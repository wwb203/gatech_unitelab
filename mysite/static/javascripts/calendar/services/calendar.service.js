(function() {
    'use strict';
    angular
        .module('thinkster.calendar.services')
        .service('CalService', CalService);
    CalService.$inject = ['$http'];
    function CalService($http) {
        var newEventCounter = 500000;
        var equipID =-1;
        var userID = -1;
        var permission = 'manage';
        var backUrl = '/';

        var CalService = {
            getNewEventId: getNewEventId,
            deleteEvent: deleteEvent,
            getMeta: getMeta,
            setMeta: setMeta,
            getBackUrl:getBackUrl,
            setBackUrl:setBackUrl,
            rateEvent: rateEvent,
            getUserCalendar: getUserCalendar,
            getDeviceCalendar: getDeviceCalendar,
            updateUserCalendar: updateUserCalendar,
            updateEvent:updateEvent,
            addEvent:addEvent
        }
        return CalService;
        function getBackUrl() {
            return backUrl;
        }
        function setBackUrl(url) {
            backUrl = url;
        }
        function updateEvent(Event) {
            if(Event.disabled) {
                Event.disable = "TRUE";
            } else {
                Event.disable = "FALSE";
            }
            Event['eventID'] = Event.id;
            Event['source'] = '';
            Event['start_time'] = Event.start.format('YYYY-MM-DD HH:mm:ss');
            Event['end_time'] = Event.end.format('YYYY-MM-DD HH:mm:ss');
            console.log(Event);
            return $http.post('/EventUpdate/',JSON.stringify({method:"change",event:Event}));
        }
        function addEvent(event) {
            if(event.disabled) {
                event.disable = "TRUE";
            } else {
                event.disable = "FALSE";
            }
            event['source'] = '';
            event['start_time'] = event.start.format('YYYY-MM-DD HH:mm:ss');
            event['end_time'] = event.end.format('YYYY-MM-DD HH:mm:ss');
            return $http.post('/EventUpdate/',JSON.stringify({method:'new',event:event}));
        }
        function rateEvent(event) {
            event['source'] = '';
            event['eventID'] = event.id;
            if(event.disabled) {
                event.disable = "TRUE";
            } else {
                event.disable = "FALSE";
            }
            return $http.post('/EventRate/',JSON.stringify(event));
        }
        function getMeta() {
            if(equipID == 2) {
            permission = 'rent';
            } else {
            permission = 'manage';
            }
            let meta = {equipID:equipID, userID:userID, permission:permission};
            return meta;
        }
        function setMeta(meta) {
            if(meta.hasOwnProperty('equipID')){
                equipID = meta.equipID;
            }
            if(meta.hasOwnProperty('permission')){
                permission = meta.permission;
            }
        }
        function deleteEvent(event){

            if(event.id > 0) {
                event['disabled'] = true;
                eventsToDelete.push(event);
            }
            console.log(eventsToDelete);
        }
        function getNewEventId() {
            newEventCounter++;
            return newEventCounter;
        }
        function getUserCalendar() {
            return($http.get('/Eventlist/'))
        }
        function getDeviceCalendar() {
            return($http.get('/Eventlist/'+ equipID +'/'))
        }
        function updateUserCalendar(events) {
            console.log(events);
        }
    }
})();
