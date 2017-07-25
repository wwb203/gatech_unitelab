(function () {
    'use strict';
    angular
        .module('thinkster.calendar.controllers')
        .controller('CalendarCtrl', CalendarCtrl);
    CalendarCtrl.$inject = ['$scope', '$compile','$timeout','uiCalendarConfig','CalService','$mdDialog','$mdToast','$interval','Authentication','$location'];
    function CalendarCtrl($scope, $compile, $timeout, uiCalendarConfig,CalService,$mdDialog,$mdToast,$interval,Authentication,$location) {
        var vm = this;
        var myName = '';
        var currentDevice = -1;//meta.equipID;
        vm.permission = 'rent';//meta.permission;
        vm.operation = '';
        vm.showCal = true;
        vm.sharing = false;
        vm.notsharing = true;
        vm.month = false;
        vm.currentView = '3Days';
        vm.reserveOrShare = 'Reserve';
        vm.backUrl = '/';
        vm.back = function() {
            $location.url(vm.backUrl);
        }
        vm.changeShareState = function() {
            if(vm.sharing) {
                vm.reserveOrShare = 'Share';
            } else {
                vm.reserveOrShare = 'Reserve';
            }
            console.log(vm.reserveOrShare);
        }
        vm.changeViewState = function() {
            if(vm.month){
                vm.changeView('month','myCalendar1');
                vm.currentView = 'Month';
            } else {
                vm.changeView('agenda3Day','myCalendar1');
                vm.currentView = '3Days';
            }
        }

        var rawUserEvents = [];
        var rawDeviceEvents = [];
        vm.events = [];
        activate();
        $interval(checkAccount, 500, 2);
        function checkAccount() {
            var accountInfo = Authentication.getAccountInfo();
            if(accountInfo) {
                if(accountInfo.username) {
                    myName = accountInfo.username;
                console.log(myName);
                }
            }
        }

        function activate() {
            //get equipID
            let meta = CalService.getMeta();
            let info = Authentication.getAuthenticatedAccount();
            myName = info.username;
            vm.backUrl = CalService.getBackUrl();
            currentDevice = meta.equipID;
            CalService.getDeviceCalendar().then(SuccessFn, ErrorFn);
            function SuccessFn(data) {
                let response = data.data;
                if(response.status == 'Success'){
                    vm.permission = response.permission;
                    if(vm.permission == 'rent') {
                        vm.operation="Rent";
                    } else if(vm.permission == 'use') {
                        vm.operation = "Reserve";
                    } else {
                        vm.operation = "Reserve and Share";
                    }
                    rawDeviceEvents = response.Eventlist;
                    removeDisabledEvents(rawDeviceEvents);
                    let events = rawDeviceEvents.splice(0);
                    for(let i = 0; i < events.length; i++) {
                        vm.events[i] = events[i];
                        vm.events[i].stick = true;
                    }
                    markupEvents();
                    vm.showCal = false;
                    vm.showCal = true;
                    $timeout(function(){vm.renderCalender('myCalendar1');},500);
                } else {
                    $mdToast.show($mdToast.simple().textContent(response.message));
                }
            }
            function ErrorFn(data) {
                $mdToast.show($mdToast.simple().textContent('Error Getting Calendar'));
            }

        };
        function markupEvents() {
            for(let i = 0; i < vm.events.length; i++) {
                let event = vm.events[i];
                event['start'] = moment(event.start_time);
                event['end'] = moment(event.end_time);
                event['deletable'] = true;

                if(event.eventType == 'share') {
                    if(event.manager == myName) {
                        markupMyShare(vm.events[i]);
                    } else {
                        markupOtherShare(vm.events[i]);
                    }
                } else if(event.eventType == 'reserve') {
                    if(event.manager == myName && event.user != myName) {
                        markupMyManage(vm.events[i]);
                    } else if(event.user == myName) {
                        markupMyReserve(vm.events[i]);
                    } else {
                        markupOtherReserve(vm.events[i]);
                    }
                }
            }
            console.log(vm.events);
        };
        $scope.addEventFromDialog = function(event) {
            CalService.addEvent(event).then(SuccessFn, ErrorFn);
            $timeout(function (){updateToCal(event);},100);
            function SuccessFn(data) {
                let response = data.data;
                if(response.status == 'Success') {
                    event.stick = true;
                    //need
                    event.id = response.event.id;
                    console.log('adding');
                    console.log(vm.events);
                    markupMyReserve(event);
                    vm.events.push(event);
                    vm.renderCalender('myCalendar1');
                    $timeout(function (){updateToCal(event);},100);
                    $mdToast.show($mdToast.simple().textContent('Event Created'));
                } else {
                    $mdToast.show($mdToast.simple().textContent(data.message));
                }
            }
            function ErrorFn(data) {
                $mdToast.show($mdToast.simple().textContent('Server Error'));
            }
        }
        $scope.updateEventFromDialog = function(event) {
            CalService.updateEvent(event).then(SuccessFn, ErrorFn);
            function SuccessFn(data) {
                let response = data.data;
                if(response.status == 'Success') {
                    for(let i = 0; i < vm.events.length; i++) {
                        if(event.id == vm.events[i].id){
                            if(event.disabled) {
                                deleteFromCal(event);
                                vm.events.splice(i,1);
                                return;
                            }else {
                                console.log(event.start);
                                console.log(event.end);
                                vm.events[i].start = event.start;
                                vm.events[i].end = event.end;
                                vm.renderCalender('myCalendar1');
                                $mdToast.show($mdToast.simple().textContent('Event Updated'));
                                //$timeout(function (){updateToCal(event);},100);
                            }
                        }
                    }
                    vm.showCal = false;
                    vm.showCal = true;
                    vm.renderCalender('myCalendar1');
                } else {
                    $mdToast.show($mdToast.simple().textContent(data.message));
                }
            }
            function ErrorFn(data) {
                $mdToast.show($mdToast.simple().textContent('Server Error'));
            }
        }
        vm.ShowCreateDialog = function () {
            $mdDialog.show({
                controller:createDialogController,
                templateUrl:'/static/templates/calendar/modal_create.html',
                clickOutsideToClose:true,
                locals: {
                    event: $scope.newEvent
                }
            }).then(function(event) {
                console.log(event);
                event.stick = true;
                $scope.addEventFromDialog(event);
            },function() {console.log('dialog cancelled')});
        };
        function createDialogController($scope, $mdDialog, event) {
            $scope.event = event;
            $scope.create = function(event) {
                if(!event.start.hasOwnProperty('_isAMomentObject')) {
                    event.start = moment(new Date(event.start)).clone();
                }
                if(!event.end.hasOwnProperty('_isAMomentObject')) {
                    event.end = moment(new Date(event.end)).clone();
                }

                $mdDialog.hide(event);
            }
            $scope.cancel = function() {
                $mdDialog.hide();
            }
        }
        vm.ShowUpdateDialog = function (event) {
            $mdDialog.show({
                controller:updateDialogController,
                templateUrl:'/static/templates/calendar/modal_update.html',
                clickOutsideToClose:true,
                locals: {
                    event: event
                }
            }).then(function(event) {
                console.log(event);
                $scope.updateEventFromDialog(event);
            },function() {console.log('dialog cancelled')});
        };
        function updateDialogController($scope, $mdDialog, event) {
            $scope.event = event;
            $scope.update = function(event) {
                event.stick= true;
                console.log('dialog update');
                if(!event.start.hasOwnProperty('_isAMomentObject')) {
                    event.start = moment(new Date(event.start)).clone();
                }
                if(!event.end.hasOwnProperty('_isAMomentObject')) {
                    event.end = moment(new Date(event.end)).clone();
                }

                $mdDialog.hide(event);
            }
            $scope.delete = function() {
                event.disabled = true;
                $mdDialog.hide(event);
            }
            $scope.cancel = function() {
                $mdDialog.hide();
            }
        }

        function dumpUserDeviceEvents(rawUserEvents, rawDeviceEvents) {
            vm.events = rawUserEvents; for(let i = 0; i < rawDeviceEvents.length; i++){
                let exist = false;
                for(let j = 0; j < rawUserEvents.length; j++) {
                    if(rawDeviceEvents[i].id == rawUserEvents[j].id) {
                        exist = true;
                        break; } }
                if(!exist) {
                    vm.events.push(rawDeviceEvents[i]);
                }
            }
        }
        function removeDisabledEvents(events) {
            for(let i = events.length - 1; i>=0; i--) {
                events[i].disabled = events[i].disable;
                if(events[i].disabled) {
                    events.splice(i,1);
                }
            }
        };
        function markupMyShare(event) {
            event['user'] = myName;
            event['textColor'] = 'black';
            event['color'] = 'rgb(0,255,255)';
            if(event.equipID == currentDevice) {
                event['editable'] = true;
            } else {
                event['editable'] = false;
            }
        };
        function markupOtherShare(event) {
            event['textColor'] = 'black';
            event['editable'] = false;

            event['rendering'] = 'background';
            if(event.equipID != currentDevice) {
                event['color'] = 'grey';
            }
        };
        function markupMyReserve(event) {
            event['textColor'] = 'black';
            if(vm.permission == 'manage' && vm.sharing == true) {
                event['color'] = 'rgb(128,128,0)';
            } else if(event.equipID != currentDevice) {
                event['color'] = 'rgb(95,158,160)';
            } else {
                event['color'] = 'rgb(30,144,255)';
            }
            if(event.equipID != currentDevice) {
                event['editable'] = false;
            } else {
                event['editable'] = true;
            }
        }
        function markupOtherReserve(event) {
            event['textColor'] = 'black';
            event['editable'] = false;

            event['color'] = 'rgb(0,128,128)';

        };
        function markupMyManage(event) {
            event['textColor'] = 'black';
            event['color'] = 'rgb(65,105,225)';
            event['editable'] = false;
            let hostEvent = findHostEvent(event.start.clone().local(), event.end.clone().local());
            if(hostEvent == undefined) return;
            if( !hostEvent.hasOwnProperty('guest')) {
                hostEvent['guest'] = [];
            }
            hostEvent['deletable'] = false;
            hostEvent['guest'].push(event);
            console.log(hostEvent);
        }

        /* where to allow selection*/
        vm.selectAllow = function(selectInfo) {
            if(vm.permission == 'rent'){
                return rentSelectAllow(selectInfo.start.clone().local(), selectInfo.end.clone().local());
            }
            if(vm.permission == 'use' || (vm.permission == 'manage' && vm.sharing == false)) {
                return useSelectAllow(selectInfo.start.clone().local(), selectInfo.end.clone().local());
            }
            if(vm.permission == 'manage' && vm.sharing == true) {
                return shareSelectAllow(selectInfo.start.clone().local(), selectInfo.end.clone().local());
            }
            return false;
        };
        function rentSelectAllow(start, end) {
            //within a share slots
            let collision = false;
            let allowed = false;
            start.add(5,'minutes');
            end.subtract(5,'minutes');
            for(let i = 0; i < vm.events.length; i++) {
                let event = vm.events[i];
                if(event.eventType == 'share' && event.equipID == currentDevice) {
                    if(start.isBetween(event.start, event.end,null, '[]')
                        && end.isBetween(event.start, event.end, null ,'[]')){
                        allowed = true;
                        break;
                    }
                }
            }
            //no overlap with myreserve and share, nor other reservation
            for(let i = 0; i < vm.events.length; i++) {
                let event = vm.events[i];
                if(event.eventType == 'reserve' ||
                    (event.eventType == 'share' && event.manager == myName)) {
                    if(!(event.end.isBefore(start) || event.start.isAfter(end))){
                        collision = true;
                        break;
                    }
                }

            }
            return (allowed == true && collision == false);
        }
        function findHostEvent(start, end) {
            //within a share slots
            start.add(5,'minutes');
            end.subtract(5,'minutes');
            for(let i = 0; i < vm.events.length; i++) {
                let event = vm.events[i];
                if(event.eventType == 'share' && event.equipID == currentDevice) {
                    if(start.isBetween(event.start, event.end,null, '[]')
                        && end.isBetween(event.start, event.end, null ,'[]')){
                        return event;
                    }
                }
            }
        }

        function useSelectAllow(start, end) {
            //no collision with reservation
            //no collision with my share
            let collision = false;
            start.add(5,'minutes');
            end.subtract(5,'minutes');
            for(let i = 0; i < vm.events.length; i++) {
                let event = vm.events[i];
                if(event.eventType == 'reserve' ||
                    (event.eventType == 'share' && event.manager == myName)) {
                    if(!(event.end.isBefore(start) || event.start.isAfter(end))){
                        collision = true;
                        break;
                    }
                }
            }
            console.log('collision'+collision);
            return !collision;
        }
        function shareSelectAllow(start, end) {
            //no collision with reservation
            //no collision with share
            let collision = false;
            start.add(5,'minutes');
            end.subtract(5,'minutes');
            for(let i = 0; i < vm.events.length; i++) {
                let event = vm.events[i];
                if(!(event.end.isBefore(start) || event.start.isAfter(end))){
                    collision = true;
                    break;
                }
            }
            return !collision;
        }
        vm.eventAllow = function(selectInfo, dragEvent) {
            if(vm.permission == 'rent'){
                return rentEventAllow(selectInfo.start.clone().local(), selectInfo.end.clone().local(), dragEvent);
            }
            if(vm.permission == 'use' || (vm.permission == 'manage' && dragEvent.eventType == 'reserve')){
                return useEventAllow(selectInfo.start.clone().local(), selectInfo.end.clone().local(), dragEvent);
            }
            if(vm.permission == 'manage' && dragEvent.eventType == 'share') {
                return shareEventAllow(selectInfo.start.clone().local(), selectInfo.end.clone().local(), dragEvent);
            }

            return false;
        }
        function rentEventAllow(start, end, dragEvent) {
            //within a share window
            //no collision with any reservation and myshare
            let collision = false;
            let allowed = false;
            start.add(5,'minutes');
            end.subtract(5,'minutes');
            for(let i = 0; i < vm.events.length; i++) {
                let event = vm.events[i];
                if(event.id == dragEvent.id) continue;
                if(event.eventType == 'share' && event.equipID == currentDevice) {
                    if(start.isBetween(event.start, event.end,null, '[]')
                        && end.isBetween(event.start, event.end, null ,'[]')){
                        allowed = true;
                        break;
                    }
                }
            }
            for(let i = 0; i < vm.events.length; i++) {
                let event = vm.events[i];
                if(event.id == dragEvent.id) continue;
                if(event.eventType == 'reserve' ||
                    (event.eventType == 'share' && event.manager == myName)) {
                    if(!(event.end.isBefore(start) || event.start.isAfter(end))){
                        collision = true;
                        break;
                    }
                }
            }
            return (allowed == true && collision == false);
        }
        function useEventAllow(start, end, dragEvent) {
            //no collision with any reservation and myshare
            let collision = false;
            start.add(5,'minutes');
            end.subtract(5,'minutes');
            for(let i = 0; i < vm.events.length; i++) {
                let event = vm.events[i];
                if(event.id == dragEvent.id) continue;
                if(event.eventType == 'reserve' ||
                    (event.eventType == 'share' && event.manager == myName)) {
                    if(!(event.end.isBefore(start) || event.start.isAfter(end))){
                        collision = true;
                        break;
                    }
                }
            }
            console.log('useEventCollision',collision);
            return !collision;
        }
        function shareEventAllow(start, end, dragEvent) {
            //no collision with any reservation and share
            //must cover myReservation beneath it
            let collision = false;
            let allow = true;
            start.subtract(5,'minutes');
            end.add(5,'minutes');

            if(dragEvent.hasOwnProperty('guest')) {
                for(let i = 0; i < dragEvent.guest.length;i++) {
                    let guestEvent = dragEvent.guest[i];
                    if(!(start.isBefore(guestEvent.start) && end.isAfter(guestEvent.end))) {
                        allow = false;
                    }
                }
            }
            start.add(10,'minutes');
            end.subtract(10,'minutes');

            for(let i = 0; i < vm.events.length; i++) {
                let event = vm.events[i];
                if(event.id == dragEvent.id) continue;
                let myGuest = false;
                if(dragEvent.hasOwnProperty('guest')) {
                    for(let j = 0; j < dragEvent.guest.length;j++) {
                        if(dragEvent.guest[j].id == event.id) {
                            myGuest = true;
                        }
                    }
                }
                if(myGuest) continue;
                if(!(event.end.isBefore(start) || event.start.isAfter(end))){
                    collision = true;
                    break;
                }
            }
            console.log('allow'+allow);
            console.log('collision' + collision);
            return (allow == true && collision == false);
        }

        /* alert on dayClick */
        vm.alertOnDayClick = function (date) {
        };


        /* alert on eventClick */
        vm.alertOnEventClick = function (date, jsEvent, view) {
            console.log(date);
            vm.ShowUpdateDialog(date);
        };
        /* alert on Drop */
        vm.alertOnDrop = function (event, delta, revertFunc, jsEvent, ui, view) {
            updateFromCal(event,revertFunc);
            vm.alertMessage = ('Event Dropped to make dayDelta ' + delta);
        };
        function updateFromCal(event,revertFunc){
            CalService.updateEvent(event).then(SuccessFn, ErrorFn);
            function SuccessFn(data) {
                let response = data.data;
                if(response.status == 'Success') {
                    for(let i = 0; i < vm.events.length; i++) {
                         if(event.id == vm.events[i].id) {
                        vm.events[i].start = event.start;
                        vm.events[i].end = event.end;
                        }
                    }
                    $mdToast.show($mdToast.simple().textContent('Event Updated'));
                } else {
                    revertFunc();
                    $mdToast.show($mdToast.simple().textContent(response.message));
                }
            }
            function ErrorFn(data) {
                    $mdToast.show($mdToast.simple().textContent('Server Error Updating Event'));
            }
        };
        function updateEventsToCal(events) {
            for(let i = 0; i < events.length; i++) {
                updateToCal(events[i]);
            }
        }
        function updateToCal(event){
            event['stick'] = true;
            let events = getFullCalendarEvents();
            console.log('clientEvents' + events.length);
            let inVM = false;
            for( let i = 0; i < vm.events.length; i++ ) {
                if(vm.events[i].id == event.id) {
                    inVM = true;
                    console.log('new event in vm.event');
                }
            }
            if(!inVM) {
                vm.events.push(event);
            }
            for(let i = 0; i < events.length; i++) {
                if(event.id == events[i].id) {
                    console.log('find event in cal');
                    events[i]['color'] = event.color;
                    events[i]['stick'] = true;
                    //vm.updateEvent('myCalendar1', event);
                    //vm.updateEvents('myCalendar1', events);
                    vm.renderCalender('myCalendar1');
                }
            }
            vm.showCal = false;
            vm.showCal = true;
        };

        /* alert on Resize */
        vm.alertOnResize = function (event, delta, revertFunc, jsEvent, ui, view) {
            updateFromCal(event,revertFunc);
            vm.alertMessage = ('Event Resized to make dayDelta ' + delta);
        };
        /* add and removes an event source of choice */
        vm.addRemoveEventSource = function (sources, source) {
            var canAdd = 0;
            angular.forEach(sources, function (value, key) {
                if (sources[key] === source) {
                    sources.splice(key, 1);
                    canAdd = 1;
                }
            });
            if (canAdd === 0) {
                sources.push(source);
            }
        };
        vm.actionOnSelect = function (start, end, jsEvent, view) {
            $scope.selectStart = start.clone().local();
            $scope.selectEnd = end.clone().local();
            $scope.newEvent = {id:CalService.getNewEventId(), disabled:false, title:'', start:start.clone(), end:end.clone(),stick:true};
            if(vm.permission == 'rent') {
                let hostEvent = findHostEvent(start.clone().local(), end.clone().local());
                $scope.newEvent['manager'] = hostEvent.manager;
                $scope.newEvent['equipID'] = currentDevice;
                $scope.newEvent['user'] = myName;
                $scope.newEvent['eventType'] = 'reserve';
                $scope.newEvent['title'] = hostEvent.manager;
                console.log(hostEvent);
                vm.ShowCreateDialog();
            }
            if(vm.permission == 'use' || (vm.permission == 'manage' && vm.sharing == false)) {
                $scope.newEvent['manager'] = myName;
                $scope.newEvent['equipID'] = currentDevice;
                $scope.newEvent['user'] = myName;
                $scope.newEvent['eventType'] = 'reserve';
                $scope.newEvent['title'] = myName + 'reserved';
                vm.ShowCreateDialog();
            }
            if(vm.permission == 'manage' && vm.sharing == true) {
                $scope.newEvent['manager'] = myName;
                $scope.newEvent['user'] = myName;
                $scope.newEvent['equipID'] = currentDevice;
                $scope.newEvent['eventType'] = 'share';
                $scope.newEvent['title'] = myName +' sharing';
                vm.ShowCreateDialog();
            }

        };
        /* add custom event*/
        vm.addEvent = function () {
            vm.events.push({
                title: vm.ev.title,
                start: moment(vm.ev.from),
                end: moment(vm.ev.to),
                allDay: true,
                className: ['openSesame']
            });
            vm.renderCalender('myCalendar1');
        };
        /* remove event */
        /*vm.remove = function (index) {
        vm.events.splice(index, 1);
    };*/
        /* Change View */
        vm.changeView = function (view, calendar) {
            uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
        };
        /* Change View */
        vm.renderCalender = function (calendar) {
            $timeout(function () {
                if (uiCalendarConfig.calendars[calendar]) {
                    uiCalendarConfig.calendars[calendar].fullCalendar('render');
                }
            });
        };
        vm.updateEvent = function (calendar, event) {
            $timeout(function () {
                if (uiCalendarConfig.calendars[calendar]) {
                    uiCalendarConfig.calendars[calendar].fullCalendar('updateEvent', event);
                    uiCalendarConfig.calendars[calendar].fullCalendar('render');
                }
            });
        };
        vm.updateEvents = function (calendar, event) {
            $timeout(function () {
                if (uiCalendarConfig.calendars[calendar]) {
                    uiCalendarConfig.calendars[calendar].fullCalendar('updateEvents', event);
                    uiCalendarConfig.calendars[calendar].fullCalendar('render');
                }
            });
        };

        function deleteFromCal(event) {
            let events = getFullCalendarEvents();
            let id = -1;
            for(let i = 0; i < events.length; i++) {
                if(event.id == events[i].id) {
                    console.log('event to delete found', event.id);
                    id = events[i]._id;
                }
            }
            uiCalendarConfig.calendars['myCalendar1'].fullCalendar('removeEvents',id);
            $timeout(function() {vm.renderCalender('myCalendar1');},100);
        }
        function getFullCalendarEvents() {
            return uiCalendarConfig.calendars['myCalendar1'].fullCalendar('clientEvents');
        }
        vm.cleanupEventsFormat = function() {
            let events = getFullCalendarEvents();
            for(let i = 0; i < events.length; i++) {
                events[i]['rendering'] = '';
                events[i]['color'] = 'blue';
                //vm.updateEvent('myCalendar1',events[i]);

            }
            vm.updateEvents('myCalendar1', events);
            console.log(vm.events);
        };
        vm.action = function() {
            vm.cleanupEventsFormat();
        }

        /* Render Tooltip */
        vm.eventRender = function (event, element, view) {};
        /* config object */
        vm.uiConfig = {
            calendar: {
                defaultView: 'agenda3Day',
                allDaySlot: false,
                height: window.innerHeight*3/4,
                scrollTime: '8:00:00',
                editable: true,
                selectable: true,
                header: {
                    left: 'prev',
                    center: 'today',
                    right: 'next'
                },
                nowIndicator: true,
                timezone:'local',
                views: {
                    agenda3Day: {
                        type:'agenda',
                        dayCount: 3,
                        buttonText: '3 day',
                        titleFormat: 'MM, DD'
                    }
                },
                dayClick: vm.alertOnDayClick,
                eventClick: vm.alertOnEventClick,
                eventDrop: vm.alertOnDrop,
                eventResize: vm.alertOnResize,
                eventRender: vm.eventRender,
                selectAllow: vm.selectAllow,
                eventAllow: vm.eventAllow,
                select: vm.actionOnSelect,
                businessHours: {
                    start: '8:00', // a start time (10am in this example)
                    end: '19:00', // an end time (6pm in this example)

                    dow: [1, 2, 3, 4, 5 ,6 ,7]
                    // days of week. an array of zero-based day of week integers (0=Sunday)
                    // (Monday-Thursday in this example)
                }
            }
        };

        /* event sources array*/
        vm.eventSources = [vm.events];
    };

})();
