//mapCtrl.ctrl.js
//deal with the map manipulation
(function(){
    'use strict';
    angular
        .module('app.map')
        .controller('MapController',MapController);

    MapController.$inject = ['$window','locationService','$rootScope','eventService'];

    function MapController($window,locationService,$rootScope,eventService){
        var vm = this;
        var mapOptions = {
            center:{lat:37.397,lng:-121.644},
            zoom:11
        };

        vm.model = locationService;
        vm.event = eventService;
        vm.markers = [];
        vm.setMarkers = setMarkers;
        vm.setAnimation = setAnimation;
        vm.stopAnimation = stopAnimation;

        vm.model.map = CreateMap(document.getElementById('map'),mapOptions);


        if ($window.navigator.geolocation) {
             $window.navigator.geolocation.getCurrentPosition(function(position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                if(vm.model.map !== {})
                    vm.model.map.setCenter(pos);
            }, function() {
                handleLocationError(true,vm.model.map.getCenter());
            });
        } else {
        // Browser doesn't support Geolocation
            handleLocationError(false,vm.model.map.getCenter());
        }


        function handleLocationError(browserHasGeolocation, pos) {
            var infoWindow = new google.maps.InfoWindow({map: vm.model.map});
            infoWindow.setPosition(pos);
            infoWindow.setContent(browserHasGeolocation ?
                'Error: The Geolocation service failed.' :
                'Error: Your browser doesn\'t support geolocation.');
        }
        function CreateMap(element,options)
        {
            var map = new google.maps.Map(element,options);
            return map;
        }

        function setMarkers(map,data){
            setAllMarkers(null);
            vm.markers = [];
            data.map(function(result,i)
            {
                var myLatLng={lat:result.geometry.location.lat(),lng:result.geometry.location.lng()};
                var marker = new google.maps.Marker({
                    position:myLatLng,
                });
                marker.addListener('click',(function(i){
                    return function(){
                        vm.event.getDetail(vm.model.currentIndex,i);
                    };
                })(i));
                vm.markers.push(marker);
            });



            setAllMarkers(map);
        }
        function setAllMarkers(map){
            vm.markers.map(function(marker)
            {
                marker.setMap(map);
            });

        }
        function setAnimation(index){
            vm.markers[index].setAnimation(google.maps.Animation.BOUNCE);
        }
        function stopAnimation(index){
            vm.markers[index].setAnimation(null);
        }
        $rootScope.$on('setMarkers',function(event,data){
            vm.setMarkers(vm.model.map,data.data);
        });
        $rootScope.$on('setAnimation',function(event,data)
        {
            vm.setAnimation(data.index);
        });
        $rootScope.$on('stopAnimation',function(event,data){
            vm.stopAnimation(data.index);
        });
        $rootScope.$on('setCenter',function(event,data){
            vm.model.map.panTo(data.geolocation);
            vm.model.map.setZoom(11);
        });
        $rootScope.$on('setMapCenter',function(event,data){
            vm.model.map.panTo(data.geolocation);
            vm.model.map.setZoom(16);
        });



    }
})();
