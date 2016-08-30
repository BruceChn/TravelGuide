angular.module('myApp',[]);

// 
// app.controller('MapCtrl',function($scope,$rootScope){
//   mapOptions = {
//     center:{lat:37.397,lng:-121.644},
//     zoom:11
//   };
//
//   $scope.map = new google.maps.Map(document.getElementById('map'),mapOptions);
//   var infoWindow = new google.maps.InfoWindow({map: map});
//
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(function(position) {
//       var pos = {
//         lat: position.coords.latitude,
//         lng: position.coords.longitude
//       };
//
//       infoWindow.setPosition(pos);
//       infoWindow.setContent('Location found.');
//       $scope.map.setCenter(pos);
//     }, function() {
//       handleLocationError(true, infoWindow, $scope.map.getCenter());
//     });
//   } else {
//     // Browser doesn't support Geolocation
//     handleLocationError(false, infoWindow, $scope.map.getCenter());
//   }
//
//
//   function handleLocationError(browserHasGeolocation, infoWindow, pos) {
//     infoWindow.setPosition(pos);
//     infoWindow.setContent(browserHasGeolocation ?
//       'Error: The Geolocation service failed.' :
//       'Error: Your browser doesn\'t support geolocation.');
//   }
// });
