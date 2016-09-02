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

    AttractionController.$inject = ['location'];
    function AttractionController(location){
        var vm = this;
        vm.model = location;

    }
})();

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

//mapCtrl.ctrl.js
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
    'use strict';

    angular
        .module('myApp')
        .filter('nonagent',nonAgent);

    function nonAgent(){
        return exCludeAgent;

        function exCludeAgent(data){
            var out = [];
            for(var i = 0;i < data.length;i++)
            {

                if(data[i].types.indexOf("travel_agency") === -1)
                {
                    out.push(data[i]);
                }
            }

            return out;
        }
    }
})();

//omnibox.dir.js

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
    OmniboxController.$inject = ['location','$http'];
    function OmniboxController(location,$http){
        var vm = this;
        vm.model = location;
        vm.SearchAttraction = SearchAttraction;



        function SearchAttraction(input){

            var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=attraction+in+" +
                input + "&key=AIzaSyB0e53B86tTI03YQGvN6gNA5s-MwTThHHY";
            $http.get(url)
                .then(function(response){
                    vm.model.data = response.data.results;
                    
                },function(error){
                    console.log(error);
                });
        }
    }
})();
