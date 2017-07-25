(function () {
    'use strict';
    angular
        .module('thinkster.calendar.controllers')
        .controller('IndexCalendarCtrl', IndexCalendarCtrl);
    IndexCalendarCtrl.$inject = ['$scope', '$compile','$timeout','uiCalendarConfig','CalService','$mdDialog','$mdToast','$interval','Authentication','$location'];
    function IndexCalendarCtrl($scope, $compile, $timeout, uiCalendarConfig,CalService,$mdDialog,$mdToast,$interval,Authentication,$location) {
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
        vm.changeShareState = function() {
            if(vm.sharing) {
                vm.reserveOrShare = 'Share';
            } else {
                vm.reserveOrShare = 'Reserve';
            }
        }
        vm.changeViewState = function() {
            if(vm.month){
                vm.changeView('month','myCalendar2');
                vm.currentView = 'Month';
            } else {
                vm.changeView('agenda3Day','myCalendar2');
                vm.currentView = '3Days';
            }
        }

        var rawUserEvents = [];
        var rawDeviceEvents = [];
        vm.events = [];
        activate();
        checkAccount();
        $interval(checkAccount, 500, 2);
        function checkAccount() {
            let name = Authentication.getusername();
            if(name) {
                myName = name;
                return;
            }
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
            currentDevice = meta.equipID;
            CalService.getUserCalendar().then(SuccessFn, ErrorFn);
            function SuccessFn(data) {
                let response = data.data;
                if(response.status == 'Success'){
                    rawUserEvents = response.Eventlist;
                    removeDisabledEvents(rawUserEvents);
                    let events = rawUserEvents.splice(0);
                    for(let i = 0; i < events.length; i++) {
                        vm.events[i] = events[i];
                        vm.events[i].stick = true;
                    }
                    markupEvents();
                                       $timeout(function(){
                                            vm.showCal = false;
                    vm.showCal = true;

                                           vm.renderCalender('myCalendar2');},300);

                    //vm.renderCalender('myCalendar2');
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
                console.log('eventType',event.eventType);

                if(event.eventType == 'share') {
                    if(event.manager == myName) {
                        markupMyShare(vm.events[i]);
                        console.log('markupMyShare');
                    } else {
                        markupOtherShare(vm.events[i]);
                        console.log('markupOtherShare');
                    }
                } else if(event.eventType == 'reserve') {
                    if(event.manager == myName && event.user != myName) {
                         markupMyManage(vm.events[i]);
                        console.log('markupMyManage');
                    } else if(event.user == myName) {
                         markupMyReserve(vm.events[i]);
                        console.log('markupMyReserve');
                    } else {
                         markupOtherReserve(vm.events[i]);
                        console.log('markupOtherShare');
                    }
                }
            }
            console.log(vm.events);
        };

        vm.ShowViewDialog = function (event) {
            $mdDialog.show({
                controller:viewDialogController,
                templateUrl:'/static/templates/layout/modal_view.html',
                clickOutsideToClose:true,
                locals: {
                    event: event
                }
            }).then(function(event) {
                console.log(event);
                let meta = {equipID:event.equipID};
                CalService.setMeta(meta);
                console.log('switching to calendar from index', event.equipID);
                CalService.setBackUrl('/myCalendar');
                $location.url('/calendar');
            },function() {console.log('dialog cancelled')});
        };
        function viewDialogController($scope, $mdDialog, event) {
            $scope.event = event;
            $scope.goto = function() {
                $mdDialog.hide(event);
            }
            $scope.delete = function() {
                event.disabled = true;
                $mdDialog.hide(event);
            }
            $scope.cancel = function() {
                $mdDialog.cancel();
            }
        }
        vm.ShowFinishDialog = function (event) {
            $mdDialog.show({
                controller:finishDialogController,
                templateUrl:'/static/templates/layout/modal_done.html',
                clickOutsideToClose:true,
                locals: {
                    event: event
                }
            }).then(function(event) {
                rateEvent(event);
            },function() {console.log('dialog cancelled')});
        };
        function finishDialogController($scope, $mdDialog, event) {
            $scope.event = event;
            $scope.im_user = false;
            if(event.user == myName) {
                $scope.im_user = true;
            }
            $scope.rate = function() {
                console.log(event);
                $mdDialog.hide(event);
            }
            $scope.cancel = function() {
                $mdDialog.cancel();
            }
        }
        function rateEvent(event) {
            CalService.rateEvent(event).then(SuccessFn, ErrorFn);
            function SuccessFn(data) {
                let response = data.data;
                if(response.status == 'Success') {
                    $mdToast.show($mdToast.simple().textContent('Event Rated'));
                } else {
                     $mdToast.show($mdToast.simple().textContent(response.message));
                }
            }
            function ErrorFn(data) {
                $mdToast.show($mdToast.simple().textContent('Server Error Rating'));
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
        };
        function markupMyReserve(event) {
            event['textColor'] = 'black';
            event['editable'] = false;
            event['color'] = '#39CCCC'
        }
        function markupOtherReserve(event) {
            event['textColor'] = 'black';
            event['editable'] = false;
            event['color'] = '#FFDC00';

        };
        function markupMyManage(event) {
            event['textColor'] = 'black';
            event['color'] = '#FF851B';
            event['editable'] = false;
            let hostEvent = findHostEvent(event.start.clone().local(), event.end.clone().local());
            if(hostEvent == undefined) return;
            if( !hostEvent.hasOwnProperty('guest')) {
                hostEvent['guest'] = [];
            }
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
            if(dragEvent.eventType == 'share') {
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
            var now = moment();
            var unfinished = false;
            if(date.start.isBefore(now) && date.type == 'reserve' && date.user != date.manager) {
                if(date.user == myName && date.manager_rate < 0) {
                    vm.ShowFinishDialog(date);
                } else if(date.manager ==myName && date.user_rate < 0 ){
                    vm.ShowFinishDialog(date);
                } else {
                    vm.ShowViewDialog(date);
                }
            } else {
                vm.ShowViewDialog(date);
            }
            console.log(date);
        };
        /* alert on Drop */
        vm.alertOnDrop = function (event, delta, revertFunc, jsEvent, ui, view) {
            updateFromCal(event);
            vm.alertMessage = ('Event Dropped to make dayDelta ' + delta);
        };
        function updateFromCal(event){
            for(let i = 0; i < vm.events.length; i++) {
                if(event.id == vm.events[i].id) {
                    vm.events[i].start = event.start;
                    vm.events[i].end = event.end;
                }
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
                    //vm.updateEvent('myCalendar2', event);
                    //vm.updateEvents('myCalendar2', events);
                    vm.renderCalender('myCalendar2');
                }
            }
            vm.showCal = false;
            vm.showCal = true;
        };

        /* alert on Resize */
        vm.alertOnResize = function (event, delta, revertFunc, jsEvent, ui, view) {
            updateFromCal(event);
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
            return;
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
                $scope.newEvent['equipID'] = currentDevice;
                $scope.newEvent['user'] = '';
                $scope.newEvent['eventType'] = 'reserve';
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
            vm.renderCalender('myCalendar2');
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

        function getFullCalendarEvents() {
            return uiCalendarConfig.calendars['myCalendar2'].fullCalendar('clientEvents');
        }
        vm.cleanupEventsFormat = function() {
            let events = getFullCalendarEvents();
            for(let i = 0; i < events.length; i++) {
                events[i]['rendering'] = '';
                events[i]['color'] = 'blue';
                //vm.updateEvent('myCalendar2',events[i]);

            }
            vm.updateEvents('myCalendar2', events);
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
                selectable: false,
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
