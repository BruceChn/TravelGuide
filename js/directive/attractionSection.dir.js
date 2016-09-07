(function(){
    'use strict';

    angular
        .module('myApp')
        .directive('attractionSection',attractionSection);

    attractionSection.$inject = ['location','$http','$window'];
    function attractionSection(location,$http,$window){
        var directive = {
            restrict:'E',
            templateUrl:"templates/attractionSection.html",
            scope:{
                name:'@',
                rating:'@',
            },
            // controller:SectionController,
            // controllerAs:'SectCtrl',
            // bindToController:true,
            link:link
        };
        function link(scope,element,attr)
        {
            scope.show = show;
            var css =  (scope.rating/5.0 * 65).toString() + 'px';
            element.find("span.nonEmptyStars").css("width",css);
            if ('photos' in location.data[parseInt(attr.index)]){
                var photo_reference = location.data[parseInt(attr.index)].photos[0].photo_reference;
                var url = "https://maps.googleapis.com/maps/api/place/photo?maxwidth="+
                $window.innerWidth+
                "&photoreference="+
                photo_reference+
                "&key=AIzaSyB0e53B86tTI03YQGvN6gNA5s-MwTThHHY";

                element.find("img.attraction_img").attr('src',url);

            }
            else {
                element.find("img.attraction_img").attr('src',"img/img_not_available.jpg");
            }
            function show(){
                angular.element('#myModal').modal();
                var img = new Image();
                if ('photos' in location.data[parseInt(attr.index)]){
                    img.onload = function(){
                        angular.element('#myModal').find('.modal-dialog').css('width',img.width);
                        angular.element('#myModal').find('.img').html(img);
                    };
                    img.src = url;


                }
                else {
                    angular.element('#myModal').find('img').attr('src',"img/img_not_available.jpg");
                }
            }

        }
        return directive;
    }
    // SectionController.$inject = ['location'];


        // var vm = this;
        // this.url = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=80&photoreference="+
        // location.data.photo_reference+
        // "&key=AIzaSyB0e53B86tTI03YQGvN6gNA5s-MwTThHHY";
        // $http.get



})();
