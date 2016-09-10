//mapCtrl.ctrl.js
(function(){
    'use strict';
    angular
        .module('myApp')
        .controller('MapController',MapController);

    //var map = new google.maps.Map(document.getElementById('map'),mapOptions);

    MapController.$inject = ['$window','location','$rootScope'];

    function MapController($window,location,$rootScope){
        var vm = this;
        var mapOptions = {
            center:{lat:37.397,lng:-121.644},
            zoom:11
        };

        vm.model = location;
        vm.markers = [];
        vm.setMarkers = setMarkers;
        vm.setAnimation = setAnimation;
        vm.stopAnimation = stopAnimation;
        vm.map = CreateMap(document.getElementById('map'),mapOptions);


        if ($window.navigator.geolocation) {
             $window.navigator.geolocation.getCurrentPosition(function(position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };


                vm.map.setCenter(pos);
            }, function() {
                handleLocationError(true,vm.map.getCenter());
            });
        } else {
        // Browser doesn't support Geolocation
            handleLocationError(false,vm.map.getCenter());
        }


        function handleLocationError(browserHasGeolocation, pos) {
            var infoWindow = new google.maps.InfoWindow({map: vm.map});
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
            for(var i = 0;i < data.length;i++){
                var myLatLng={lat:data[i].geometry.location.lat,lng:data[i].geometry.location.lng};
                var marker = new google.maps.Marker({
                    position:myLatLng,
                });
                marker.addListener('click',(function(i){
                    return function(){
                        $rootScope.$emit('getDetail',{index:i});
                    };
                })(i));
                vm.markers.push(marker);
            }
            setAllMarkers(map);
        }
        function setAllMarkers(map){
            for(var i = 0;i < vm.markers.length;i++)
            {
                vm.markers[i].setMap(map);
            }
        }
        function setAnimation(index){
            vm.markers[index].setAnimation(google.maps.Animation.BOUNCE);
        }
        function stopAnimation(index){
            vm.markers[index].setAnimation(null);
        }
        $rootScope.$on('setMarkers',function(event,data){

            vm.setMarkers(vm.map,data.data);
        });
        $rootScope.$on('setAnimation',function(event,data)
        {
            vm.setAnimation(data.index);
        });
        $rootScope.$on('stopAnimation',function(event,data){
            vm.stopAnimation(data.index);
        });
        $rootScope.$on('setCenter',function(event,data){
            vm.map.panTo(data.position);
            vm.map.setZoom(11);
        });
        $rootScope.$on('setMapCenter',function(event,data){
            vm.map.panTo(data.location);
            vm.map.setZoom(16);
        });



    }
})();
