//detail.dir.js

(function(){
    'use strict';

    angular
        .module('app.detail')
        .directive('detail',detail);
    detail.$inject = ['$rootScope','locationService','$state'];
    function detail($rootScope,locationService,$state){
        var directive ={
            restrict:'E',
            scope:{
            },
            link:link,
            templateUrl:"templates/detail.html"
        };
        function link(scope,element,attr){

            scope.types = [];
            scope.model = locationService;
            scope.back = back;

            //set rating value and photo src url and set types
            activate();

            function activate(){
                setTypes();
                setRatings();
                setImg();
                setWikipedia();
                getDetailPhotos();

            }
            function back(){
                $state.go('attraction');
                $rootScope.$emit('setCenter',{geolocation:{lat:scope.model.data[0].geometry.location.lat,lng:scope.model.data[0].geometry.location.lng}});
            }
            function setTypes(){
                angular.forEach(scope.model.detail.types,function(value)
                {
                    if(value !== 'point_of_interest')
                        scope.types.push(value);
                });
            }
            function setRatings(){
                var width =  (scope.model.detail.rating/5.0 * 65).toString() + 'px';
                element.find('span.detail-nonEmptyStars').css('width',width);
            }
            function setImg(){
                var url;
                if('photos' in scope.model.data[parseInt(attr.index)])
                    scope.photo_reference= scope.model.data[parseInt(attr.index)].photos[0].photo_reference;
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
                element.find('div.panel-body').prepend(scope.model.wikipedia.snippet);
                scope.wikilink = "https://en.wikipedia.org/wiki/" + scope.model.wikipedia.title;
            }
            function getDetailPhotos(){
                scope.photos = [];
                var reference,
                    photoUrl;
                for(var i = 1;i < scope.model.detail.photos.length;i++)
                {
                    reference = scope.model.detail.photos[i].photo_reference;
                    photoUrl = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=408&photoreference="+
                    reference+
                    "&key=AIzaSyB0e53B86tTI03YQGvN6gNA5s-MwTThHHY";
                    scope.photos.push(photoUrl);
                }
                reference = scope.model.detail.photos[0].photo_reference;
                photoUrl = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=408&photoreference="+
                reference+
                "&key=AIzaSyB0e53B86tTI03YQGvN6gNA5s-MwTThHHY";
                scope.photos.push(photoUrl);
            }

        }
        return directive;
    }
})();
