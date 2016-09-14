//flashService.factorty.js
//used to manipulate the flash data
(function(){
    'use strict';

    angular
        .module('app.widget')
        .factory('FlashService',FlashService);

    FlashService.$inject = ['$timeout','$rootScope'];
    function FlashService($timeout,$rootScope){

        var dataFactory = {
            create:create,
            dismiss:dismiss,
            flash:{
                text:'',
                timeout:5000
            },
            hasFlash:false
        },
        timeout;
        function create(text){
            $timeout.cancel(timeout);
            dataFactory.flash.text = text;

            dataFactory.hasFlash = true;
            timeout = $timeout(function(){
                dataFactory.dismiss();
            },dataFactory.flash.timeout);
        }
        function dismiss() {
            $timeout.cancel(timeout);
            $timeout(function() {
                dataFactory.hasFlash = false;
            });
        }
        return dataFactory;
    }
})();
