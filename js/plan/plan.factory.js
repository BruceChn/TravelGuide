//plan.factory.js

(function(){
    'use strict';

    angular
        .module('app.plan')
        .factory('planService',planService);

    function planService(){
        var model={
            current:[],
            selected:[]
        };
        return model;
    }
})();
