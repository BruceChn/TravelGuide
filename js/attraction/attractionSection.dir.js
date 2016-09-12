/*attractionSection.dir.js*/

(function(){
    'use strict';

    angular
        .module('app.attraction')
        .directive('attractionSection',attractionSection);

    attractionSection.$inject = ['locationService','$http','$window','permissionService'];
    function attractionSection(locationService,$http,$window,permissionService){
        var directive = {
            restrict:'E',
            templateUrl:"templates/attractionSection.html",
            scope:{
                name:'@',
                rating:'@',
                address:'@',
                pageIndex:'=',
                click:'&',
                index:'='
            },
            link:link,
            controller:SectionController
        };
        function link(scope,element,attr)
        {
            scope.model = locationService;
            scope.permissionService = permissionService;
            scope.show = show;


            activate();

            function activate(){
                setImg();
            }
            function setImg(){
                var css =  (scope.rating/5.0 * 65).toString() + 'px';
                element.find("span.nonEmptyStars").css("width",css);

                if ('photos' in scope.model.data[scope.index]){
                    //var photo_reference = scope.model.data[parseInt(attr.index)].photos[0].photo_reference;
                    var url = scope.model.data[scope.index].photos[0].getUrl({maxWidth:80});

                    element.find("img.attraction_img").attr('src',url);

                }
                else {
                    element.find("img.attraction_img").attr('src',"img/img_not_available.jpg");
                }
            }
            function show(){

                var img = new Image();
                if ('photos' in scope.model.data[scope.index]){

                    img.src= scope.model.data[scope.index].photos[0].getUrl({maxWidth:Math.round($window.innerWidth * 0.9)});
                    img.onload = function(){

                        angular.element('#myModal').find('.modal-dialog').css('width',img.width);
                        angular.element('#myModal').find('.img').html(img);
                        angular.element('#myModal').modal();
                    };
                }
                else {
                    img.src = "img/img_not_available.jpg";
                    img.onload = function(){

                        angular.element('#myModal').find('.modal-dialog').css('width',img.width);
                        angular.element('#myModal').find('.img').html(img);
                        angular.element('#myModal').modal();
                    };
                }
            }

        }
        return directive;
    }
    SectionController.$inject = ['$scope'];
    function SectionController($scope){
        this.index = $scope.index;
    }
    // SectionController.$inject = ['location'];


        // var vm = this;
        // this.url = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=80&photoreference="+
        // location.data.photo_reference+
        // "&key=AIzaSyB0e53B86tTI03YQGvN6gNA5s-MwTThHHY";
        // $http.get



})();
