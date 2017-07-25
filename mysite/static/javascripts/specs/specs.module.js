(function() {
  'use strict';
  angular
    .module('thinkster.specs', [
      'thinkster.specs.controllers',
      'thinkster.specs.services',
      'thinkster.specs.directives'
    ]);
  angular
    .module('thinkster.specs.controllers',['ui.bootstrap','ui.select','ngSanitize','ngAnimate']);
  angular
    .module('thinkster.specs.directives',[]);
  angular
    .module('thinkster.specs.services',['ngCookies','ngRoute']);
})();
