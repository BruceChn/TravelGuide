//flash.dir.js
//Flash meassage widget
(function(){
    'use strict';

    angular
        .module('app.widget')
        .directive('flash',flash);
    flash.$inject = ['FlashService'];
    function flash(FlashService)
    {
        var dir = {

            restrict:'E',
            templateUrl:'templates/flash.html',
            link:link

        };
        function link(scope){
            scope.flash = FlashService;
        }
        return dir;

    }
})();
