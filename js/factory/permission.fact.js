//permission.fact.js

//use this service to make sure that direct access to the detail view by typing in the url

(function(){
    'use strict';

    angular
        .module('myApp')
        .factory('permission',permission);

    function permission(){
        var model ={
            isAllowed:false
        };
        return model;
    }
})();
