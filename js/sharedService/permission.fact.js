//permission.fact.js

//use this service to make sure that direct access to the detail view by typing in the url

(function(){
    'use strict';

    angular
        .module('app.service')
        .factory('permissionService',permissionService);

    function permissionService(){
        var model ={
            isAllowed:false, //determine if it is allowed to enter the detail route view
            planMode:false, //decide if it is the planMode
            endHint:false
        };
        return model;
    }
})();
