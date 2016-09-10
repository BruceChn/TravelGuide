//detail.dir.js

(function(){
    'use strict';

    angular
        .module('myApp')
        .directive('detail',detail);
    detail.$inject = ['$http','location'];
    function detail($http,location){
        var directive ={
            restrict:'E',
            scope:{
            },
            link:link,
            templateUrl:"templates/detail.html"
        };
        function link(scope,element,attr){
            scope.name = location.detail.name;
            scope.types = [];
            scope.rating = location.detail.rating;

            //set rating value and photo src url and set types
            activate();

            function activate(){
                setTypes();
                setRatings();
                setImg();
                setWikipedia();
                getDetailPhotos();

            }

            function setTypes(){
                angular.forEach(location.detail.types,function(value)
                {
                    if(value !== 'point_of_interest')
                        scope.types.push(value);
                });
            }
            function setRatings(){
                var width =  (scope.rating/5.0 * 65).toString() + 'px';
                element.find('span.detail-nonEmptyStars').css('width',width);
            }
            function setImg(){
                var url;
                if('photos' in location.data[parseInt(attr.index)])
                    scope.photo_reference= location.data[parseInt(attr.index)].photos[0].photo_reference;
                else {
                    scope.photo_reference = "unavailable";
                }

                if(scope.photo_reference !== "unavailable")
                {
                    url = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=408&photoreference="+
                    scope.photo_reference+
                    "&key=AIzaSyB0e53B86tTI03YQGvN6gNA5s-MwTThHHY";
                }
                else
                {
                    url = "/img/img_not_available.jpg";
                }
                element.find('img.header_img').attr('src',url);
            }
            function setWikipedia(){
                element.find('div.panel-body').prepend(location.wikipedia.snippet);
                scope.wikilink = "https://en.wikipedia.org/wiki/" + location.wikipedia.title;
            }
            function getDetailPhotos(){
                scope.photos = [];
                var reference,
                    photoUrl;
                for(var i = 1;i < location.detail.photos.length;i++)
                {
                    reference = location.detail.photos[i].photo_reference;
                    photoUrl = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=408&photoreference="+
                    reference+
                    "&key=AIzaSyB0e53B86tTI03YQGvN6gNA5s-MwTThHHY";
                    scope.photos.push(photoUrl);
                }
                reference = location.detail.photos[0].photo_reference;
                photoUrl = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=408&photoreference="+
                reference+
                "&key=AIzaSyB0e53B86tTI03YQGvN6gNA5s-MwTThHHY";
                scope.photos.push(photoUrl);
            }

        }
        return directive;
    }
})();
