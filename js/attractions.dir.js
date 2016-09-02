//attractions.directive.

(function(){
    'use strict';
    angular
        .module('myApp')
        .directive("attractions",Attractions);

    // define attractions directive
    function Attractions(){
        return{
          restrict:"E",
          scope:{},
          controller:AttractionController,
          controllerAs:'atCtrl',
          bindToController:true,
          templateUrl:"templates/attraction.html"
        };
    }

    AttractionController.$inject = ['location'];
    function AttractionController(location){
        var vm = this;
        vm.model = location;

    }
})();
