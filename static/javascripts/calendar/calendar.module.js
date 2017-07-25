(function () {
  'use strict';
  angular
    .module('thinkster.calendar', [
      'thinkster.calendar.controllers',
        'thinkster.calendar.services'
    ]);
  angular
    .module('thinkster.calendar.controllers',['ui.calendar', 'ui.bootstrap','ngDialog']);
    angular
    .module('thinkster.calendar.services',[]);
})();
