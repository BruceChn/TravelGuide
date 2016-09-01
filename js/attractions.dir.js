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
          controller:function($scope){
              $scope.attractions = [{name:"a"},{name:"b"},{name:"c"},{name:"d"}];
          },
          templateUrl:"templates/attraction.html"
        };
    }
})();
