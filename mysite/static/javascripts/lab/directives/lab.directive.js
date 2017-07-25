(function () {
    'use strict';
    angular
        .module('thinkster.lab.directives')
        .directive('nop',nop);
    function nop() {
        return {
            link: function(scope,element) {
                element.find('input').on('keydown', function(ev){
                    ev.stopPropagation();
                });
            }
        }
    }
})();
