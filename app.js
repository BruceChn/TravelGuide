angular.module('myApp',[]);

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
    function AttractionController(location){
        var vm = this;
        vm.model = location;

    }
})();

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

(function(){
    'use strict';
    angular
        .module('myApp')
        .controller('MapController',MapController);

    //var map = new google.maps.Map(document.getElementById('map'),mapOptions);

    MapController.$inject = ['$window','location'];

    function MapController($window,location){
        var vm = this;
        var mapOptions = {
            center:{lat:37.397,lng:-121.644},
            zoom:11
        };

        var input = location.searchInput;
        console.log(input);
        vm.map = CreateMap(document.getElementById('map'),mapOptions);
        var infoWindow = new google.maps.InfoWindow({map: vm.map});

        if ($window.navigator.geolocation) {
             $window.navigator.geolocation.getCurrentPosition(function(position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                infoWindow.setPosition(pos);
                infoWindow.setContent('Current Location');
                vm.map.setCenter(pos);
            }, function() {
                handleLocationError(true, infoWindow, vm.map.getCenter());
            });
        } else {
        // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, vm.map.getCenter());
        }


        function handleLocationError(browserHasGeolocation, infoWindow, pos) {
            infoWindow.setPosition(pos);
            infoWindow.setContent(browserHasGeolocation ?
                'Error: The Geolocation service failed.' :
                'Error: Your browser doesn\'t support geolocation.');
        }
        function CreateMap(element,options)
        {
            return new google.maps.Map(element,options);
        }
    }
})();

(function(){
    angular
        .module('myApp')
        .directive('omnibox',OmniBox);

    function OmniBox(){
        var directive ={
            restrict:'E',
            scope:{},
            templateUrl:"templates/omniBox.html",
            controller:OmniboxController,
            controllerAs:"obCtrl",
            bindToController:true
        };
        return directive;
    }
    OmniboxController.$inject = ['location'];
    function OmniboxController(location){
        var vm = this;
        vm.model = location;
        vm.SearchAttraction = SearchAttraction;
        
        function SearchAttraction(input){
            console.log(input);
        }
    }
})();
