angular
    .module('myApp')
    .directive("attractions",function(){
      return{
        restrict:"E",
        scope:{},
        controller:function($scope){
            $scope.attractions = [{name:"a"},{name:"b"},{name:"c"},{name:"d"}];
        },
        templateUrl:"attraction.html",
      };
    });
