//location.fact.js

(function(){
    'use strict';

    angular
        .module('myApp')
        .factory('location',location);

    function location(){
        var model={
            data:[]
        };
        return model;
    }
})();
