(function() {
  'use strict';
  angular
    .module('thinkster.lab', [
      'thinkster.lab.controllers',
      'thinkster.lab.services',
      'thinkster.lab.directives'
    ]);
  angular
    .module('thinkster.lab.controllers',['ui.bootstrap','ui.select','ngSanitize','ngAnimate']);
  angular
    .module('thinkster.lab.directives',[]);
  angular
    .module('thinkster.lab.services',['ngCookies']);
})();
