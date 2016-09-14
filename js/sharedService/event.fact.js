//event.factory.js
//moved the registered rootScope event to event Service to avoid the duplicate event registeration
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
