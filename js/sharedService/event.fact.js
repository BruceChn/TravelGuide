(function(){
    'use strict';
    angular
        .module('app.service')
        .factory('eventService',eventService);

    function eventService(){
        var model = {
            getDetail:{},
            reset:{}
        };
        return model;
    }
})();
