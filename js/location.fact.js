//location.fact.js

(function(){
    'use strict';

    angular
        .module('myApp')
        .factory('location',location);

    function location(){
        var model={
            data:[],
            isZeroData:0 // 0: don't displya result 1: no return result  2: show results; 
        };
        return model;
    }
})();
