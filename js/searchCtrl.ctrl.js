(function(){
    'use strict';

    angular
        .module('myApp')
        .controller('SearchController',SearchController);

    SearchController.$inject = ['location'];
    function SearchController(location){
        var vm = this;
        vm.model = location;

    }
})();
