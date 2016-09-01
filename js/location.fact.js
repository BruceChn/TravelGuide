(function(){
    'use strict';

    angular
        .module('myApp')
        .factory('location',location);

    function location(){
        var initalInput = "";
        var model={
            searchInput:initalInput
        };
        return model;
    }
})();
