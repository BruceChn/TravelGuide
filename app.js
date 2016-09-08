angular.module('myApp',['ngAnimate']);

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
        .controller('SearchController',SearchController);

    SearchController.$inject = ['location'];
    function SearchController(location){
        var vm = this;
        vm.model = location;
        vm.show = true;
        vm.toggle = toggle;

        function toggle(){
            vm.show = !vm.show;
            var button = angular.element('.pane-toggle-button');
            if(!vm.show)
            {
                angular.element('.pane-toggle-button-container').css('left','0px');

                button.css('transform','scaleX(-1)');
                button.attr('data-original-title','expand side pane');

            }
            else
            {
                angular.element('.pane-toggle-button-container').css('left','100%');
                button.css('transform','scaleX(1)');
                button.attr('data-original-title','collapse side pane');

            }
        }

    }
})();

//attractions.directive.

(function(){
    'use strict';
    angular
        .module('myApp')
        .directive("attractions",Attractions);

    // define attractions directive
    Attractions.$inject = ['location','$http'];
    function Attractions(location){
        return{
          restrict:"E",
          scope:{
              click:"&",
              show:"="
          },
          controller:AttractionController,
          controllerAs:'atCtrl',
          bindToController:true,
          templateUrl:"templates/attraction.html",
          link:link
        };
        function link(scope,element){
            scope.model = location;
            scope.results = [];
            scope.currentStart = 1;
            scope.previous = previous;
            scope.next = next;
            activate();
            function activate(){
                if(scope.model.currentIndex === 0)
                {
                    element.find('button#pane-section-pagination-button-prev').addClass('pane-section-pagination-button-disabled');
                }
                else {
                    element.find('button#pane-section-pagination-button-prev').removeClass('pane-section-pagination-button-disabled');
                }

            }
            scope.$watch('model.currentIndex',function(newValue, oldValue, scope){
                if(newValue === 0)
                {
                    element.find('button#pane-section-pagination-button-prev').addClass('pane-section-pagination-button-disabled');
                }
                else {
                    element.find('button#pane-section-pagination-button-prev').removeClass('pane-section-pagination-button-disabled');
                }
            },true);

            function previous(){
                scope.model.currentIndex--;
                scope.model.data = scope.results[scope.model.currentIndex];

                scope.currentStart = scope.currentStart - scope.results[scope.model.currentIndex].length;
            }
            function next(){


                if(scope.model.currentIndex === (scope.results.length - 1))
                {
                    angular.element('div.section-refresh-overlay').css('visibility','visible');
                    var promise = location.next();
                    promise.then(function(response){

                        scope.currentStart += scope.results[scope.model.currentIndex - 1].length;
                        angular.element('div.section-refresh-overlay').css('visibility','hidden');

                    },function(error){
                        console.log(error);
                    });
                }
                else {
                    scope.model.currentIndex++;
                    scope.model.data = scope.results[scope.model.currentIndex];
                    scope.currentStart += scope.results[scope.model.currentIndex - 1].length;
                }


            }

        }
    }

    AttractionController.$inject = ['location'];
    function AttractionController(location){
        var vm = this;
        vm.model = location;
    }
})();

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

(function(){
    'use strict';

    angular
        .module('myApp')
        .directive('imgViewer',imgViewer);

    function imgViewer(){
        var dir = {
            restrict:'E',
            // link:link,
            templateUrl:'templates/imgViewer.html',
        };

        return dir;
    }



})();

//omnibox.dir.js

(function(){
    angular
        .module('myApp')
        .directive('omnibox',OmniBox);

    OmniBox.$inject = ['location'];
    function OmniBox(location){
        var directive ={
            restrict:'E',
            scope:{},
            templateUrl:"templates/omniBox.html",
            // controller:OmniboxController,
            // controllerAs:"obCtrl",
            // bindToController:true,
            link:link


        };
        return directive;
        function link(scope,element,attr){
            var vm = scope;
            vm.model = location;
            vm.SearchAttraction = SearchAttraction;
            function SearchAttraction(input){
                if(input !== '' && input !== undefined)
                {
                    vm.model.currentIndex = 0;
                    var promise = location.search(input);
                    element.find('button.searchbtnbox').toggleClass('changed');
                    promise.then(function(){
                        element.find('button.searchbtnbox').toggleClass('changed');
                    },function(error){
                        console.log(error);
                    });
                }
            }

        }
    }
})();
    // OmniboxController.$inject = ['location','$http'];
    // function OmniboxController(location,$http){
    //     var vm = this;
    //     vm.model = location;
    //     vm.SearchAttraction = SearchAttraction;
    //
    //     function randomString(length, chars) {
    //             var result = '';
    //             for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    //             return result;
    //     }
    //     function SearchAttraction(input){
    //
    //         if(input !== '' && input !== undefined)
    //         {
    //             vm.model.currentIndex = 0;
    //             var promise = location.search(input);
    //             console.log(promise);
    //             // var promise = location.search(input);
    //             // console.log(promise);
    //             // promise.then(function(response){
    //             //     console.log("ishere");
    //             // },function(error){
    //             //     console.log(error);
    //             // });
    //         }
    //         // var options = {
    //         //     encodeSignature: true // will encode the signature following the RFC 3986 Spec by default
    //         // };
    //         // var params={
    //         //     location:'San+Jose',
    //         //     term:'Emma Prusch Farm Park',
    //         //     oauth_consumer_key:'b2G0vHIw1gVt93iGcS6oFQ',
    //         //     oauth_token:'GbTx68VEu2xMFz6niwbn1R1GcxMGMYCk',
    //         //     oauth_signature_method: "HMAC-SHA1",
    //         //     oauth_timestamp: new Date().getTime(),
    //         //     oauth_nonce: randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
    //         //
    //         // };
    //         // var ConsumerSecret = 'RRSvLYsj1-jfW9V7NqquNxcAjQg';
    //         // var TokenSecret = 'E3FVhEOGrSY6RrhA68ZmpDyHf_4';
    //         //
    //         // var oauth_signature = oauthSignature.generate('GET',"https://api.yelp.com/v2/search",params,ConsumerSecret,TokenSecret,options);
    //         // params.oauth_signature = oauth_signature;
    //         // $http({
    //         //     url:"https://api.yelp.com/v2/search",
    //         //     method:'GET',
    //         //     params:params
    //         // }).then(function(response){
    //         //     console.log(response);
    //         // });
    //     }
    // }

(function(){
    'use strict';
    angular
        .module('myApp')
        .directive('tooltip', function(){
            var directive = {

                restrict: 'A',
                link:link
            };
            return directive;
            function link(scope,element){
                    $(element).hover(function(){
                        // on mouseenter
                        $(element).tooltip('show');
                    }, function(){
                        // on mouseleave
                        $(element).tooltip('hide');
                    });

            }
        });
})();

//nonAgent.filter.js

// filter used to eliminate the travel_agency results from google search
//update: used it to eliminate non-rating results also
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

                if(data[i].types.indexOf("travel_agency") === -1 && ('rating' in data[i]))
                {
                    out.push(data[i]);
                }
            }

            return out;
        }
    }
})();

//location.fact.js

(function(){
    'use strict';

    angular
        .module('myApp')
        .factory('location',location);
    location.$inject = ['$http'];
    function location($http){
        var model={
            data:[],
            isZeroData:0,// 0: don't displya result 1: no return result  2: show results;
            currentIndex:0,
            search:search,
            next:next,
            nextPageToken:"",
            input:""
        };
        function search(input){
            model.currentIndex = 0;
            model.input = input;
            var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=attraction+in+" +
                model.input + "&key=AIzaSyB0e53B86tTI03YQGvN6gNA5s-MwTThHHY";
            return $http.get(url)
                .then(function(response){
                    model.data = response.data.results;
                    if('next_page_token' in response.data){
                        model.nextPageToken = response.data.next_page_token;
                    }
                    else {
                        model.nextPageToken = "";
                    }
                    model.isZeroData = (response.data.results.length === 0)?1:2;
                });
            console.log("ishere");
        }
        function next(){
            if(model.nextPageToken !== "")
            {
                var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=attraction+in+" +
                    model.input + "&key=AIzaSyB0e53B86tTI03YQGvN6gNA5s-MwTThHHY" +  "&pagetoken=" + model.nextPageToken;

                model.currentIndex++;
                return $http.get(url)
                        .then(function(response){
                            model.data = response.data.results;
                            if('next_page_token' in response.data)
                            {
                                model.nextPageToken = response.data.next_page_token;
                            }
                            else {
                                model.nextPageToken = "";
                            }
                            model.isZeroData = (response.data.results.length === 0)?1:2;
                        });

            }

        }
        return model;
    }
})();
