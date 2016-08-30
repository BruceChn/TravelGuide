angular.module('myApp')
    .controller('MapController',MapController);

function MapController($scope,$rootScope){
    var vm = this;
    mapOptions = {
        center:{lat:37.397,lng:-121.644},
        zoom:11
    };

    vm.map = new google.maps.Map(document.getElementById('map'),mapOptions);
    var infoWindow = new google.maps.InfoWindow({map: map});

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

        infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            m.map.setCenter(pos);
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
}
