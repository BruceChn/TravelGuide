angular.module('myApp',['ngAnimate','ui.router']);

//app.route.js
(function(){
    'use strict';

    angular
        .module('myApp')
        .config(config);
    function config($stateProvider,$urlRouterProvider)
    {
        $urlRouterProvider
            .otherwise('/');
        $stateProvider
            .state('attraction',{
                url:'/',
                template:'<attractions show = "SearchCtrl.show" class = "attractions-container"></attractions>'
            })
            .state('detail',{
                url:'/:pageIndex/:index',
                template:'<detail index = "{{detailCtrl.index}}"><detail>',
                controller:detailController,
                controllerAs:'detailCtrl',
                resolve:{
                    authenticate:authenticate
                }
            });
        authenticate.$inject = ['$q','permission','$state','$timeout'];
        function authenticate($q,permission,$state,$timeout){
            if(permission.isAllowed)
            {
                permission.isAllowed = false;
                return $q.when();
            }
            else {
                $timeout(function(){
                    $state.go('attraction');
                });
                return $q.reject();

            }
        }
    }

    detailController.$inject = ['$stateParams'];
    function detailController($stateParams,location){
        var vm = this;
        vm.pageIndex = $stateParams.pageIndex;
        vm.index = $stateParams.index;

    }

})();

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

// searchCtrl.ctrl.js

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
    Attractions.$inject = ['location','$rootScope','$filter','$state','$q','permission'];
    function Attractions(location,$rootScope,$filter,$state,$q,permission){
        return{
          restrict:"E",
          scope:{
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
            scope.animate = animate;
            scope.stopAnimate = stopAnimate;
            scope.getDetail = getDetail;
            $rootScope.$on('reset',function(event,data){
                scope.results = [];
                scope.currentStart = 1;

            });
            $rootScope.$on('getDetail',function(event,data){
                getDetail(scope.model.currentIndex,data.index);
            });
            //watch if in the first page
            scope.$watch('model.currentIndex',function(newValue, oldValue, scope){

                if(newValue === 0)
                {
                    element.find('button#pane-section-pagination-button-prev').addClass('pane-section-pagination-button-disabled');
                }
                else {
                    element.find('button#pane-section-pagination-button-prev').removeClass('pane-section-pagination-button-disabled');
                }
            },true);


            // go to the previous page
            function previous(){
                scope.model.currentIndex--;
                scope.model.data = scope.results[scope.model.currentIndex];
                scope.currentStart = scope.currentStart - scope.results[scope.model.currentIndex].length;
                $rootScope.$emit('setMarkers',{data:location.data});
            }
            // go to the next page
            function next(){

                // if in the last page, then go to the new page needs http request
                if(scope.model.currentIndex === (scope.results.length - 1))
                {
                    angular.element('button.searchbtnbox').toggleClass('changed');
                    angular.element('div.section-refresh-overlay').css('visibility','visible');
                    var promise = location.next();
                    promise.then(function(response){

                        scope.currentStart += scope.results[scope.model.currentIndex - 1].length;
                        angular.element('button.searchbtnbox').toggleClass('changed');
                        angular.element('div.section-refresh-overlay').css('visibility','hidden');
                        $rootScope.$emit('setMarkers',{data:location.data});

                    },function(error){
                        console.log(error);
                    });
                }
                else {
                    scope.model.currentIndex++;
                    scope.model.data = scope.results[scope.model.currentIndex];
                    scope.currentStart += scope.results[scope.model.currentIndex - 1].length;
                    $rootScope.$emit('setMarkers',{data:location.data});
                }
            }
            function animate(index){
                $rootScope.$emit('setAnimation',{index:index});
            }
            function stopAnimate(index){
                $rootScope.$emit('stopAnimation',{index:index});
            }
            function getDetail(pageIndex,index){
                angular.element('button.searchbtnbox').toggleClass('changed');
                angular.element('div.section-refresh-overlay').css('visibility','visible');
                var photo_reference = ('photos' in scope.results[pageIndex][index]) ?scope.results[pageIndex][index].photos[0].photo_reference:"unavailable";
                $rootScope.$emit('setMapCenter',{location:scope.results[pageIndex][index].geometry.location});

                var promise1 = scope.model.getDetail(scope.results[pageIndex][index].reference);
                var promise2 = scope.model.getWikipedia(scope.results[pageIndex][index].name);
                $q.all([promise1,promise2]).then(function(){
                    angular.element('div.section-refresh-overlay').css('visibility','hidden');
                    angular.element('button.searchbtnbox').toggleClass('changed');
                    permission.isAllowed = true;
                    $state.go('detail',{pageIndex:pageIndex,index:index});
                });

            }

        }
    }

    AttractionController.$inject = ['location','$http'];
    function AttractionController(location,$http){
        var vm = this;
        vm.model = location;
        // function randomString(length, chars) {
        //     var result = '';
        //     for (var i = length; i > 0; --i) {
        //         result += chars[Math.round(Math.random() * (chars.length - 1))];
        //     }
        //     return result;
        // }
        // var options = {
        //     encodeSignature: true // will encode the signature following the RFC 3986 Spec by default
        // };
        // var params={
        //     location:'San+Jose',
        //     term:'Emma Prusch Farm Park',
        //     oauth_consumer_key:'b2G0vHIw1gVt93iGcS6oFQ',
        //     oauth_token:'GbTx68VEu2xMFz6niwbn1R1GcxMGMYCk',
        //     oauth_signature_method: "HMAC-SHA1",
        //     oauth_timestamp: new Date().getTime(),
        //     oauth_nonce: randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
        //
        // };
        // var ConsumerSecret = 'RRSvLYsj1-jfW9V7NqquNxcAjQg';
        // var TokenSecret = 'E3FVhEOGrSY6RrhA68ZmpDyHf_4';
        //
        // var oauth_signature = oauthSignature.generate('GET',"https://api.yelp.com/v2/search",params,ConsumerSecret,TokenSecret,options);
        // params.oauth_signature = oauth_signature;
        // $http({
        //     url:"https://api.yelp.com/v2/search",
        //     method:'GET',
        //     params:params
        // }).then(function(response){
        //     console.log(response);
        // });
    }
})();

/*attractionSection.dir.js*/

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
                location:'@',
                pageIndex:'=',
                click:'&'
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
            scope.index = parseInt(attr.index);

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

/*imgViewer.dir.js*/
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

    OmniBox.$inject = ['location','$rootScope','$filter','$state'];
    function OmniBox(location,$rootScope,$filter,$state){
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
                        $state.go('attraction',{});
                        element.find('button.searchbtnbox').toggleClass('changed');
                        //element.find('button#pane-section-pagination-button-prev').addClass('pane-section-pagination-button-disabled');
                        $rootScope.$emit('setMarkers',{data:location.data});
                        $rootScope.$emit('reset',{});
                        $rootScope.$emit('setCenter',{position:{lat:location.data[0].geometry.location.lat,lng:location.data[0].geometry.location.lng}});

                    },function(error){
                        console.log(error);
                    });

                }
            }
        //     var randomString = function (length, chars) {
        //   var result = '';
        //   for (var i = length; i > 0; --i) {
        //     result += chars[Math.round(Math.random() * (chars.length - 1))];
        //   }
        //   return result;
        // };
        //     var options = {
        //         encodeSignature: true // will encode the signature following the RFC 3986 Spec by default
        //     };
        //     var params={
        //         location:'San+Jose',
        //         term:'Emma Prusch Farm Park',
        //         oauth_consumer_key:'b2G0vHIw1gVt93iGcS6oFQ',
        //         oauth_token:'GbTx68VEu2xMFz6niwbn1R1GcxMGMYCk',
        //         oauth_signature_method: "HMAC-SHA1",
        //         oauth_timestamp: new Date().getTime(),
        //         oauth_nonce: randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
        //
        //     };
        //     var ConsumerSecret = 'RRSvLYsj1-jfW9V7NqquNxcAjQg';
        //     var TokenSecret = 'E3FVhEOGrSY6RrhA68ZmpDyHf_4';
        //
        //     var oauth_signature = oauthSignature.generate('GET',"https://api.yelp.com/v2/search",params,ConsumerSecret,TokenSecret,options);
        //     params.oauth_signature = oauth_signature;
        //     $http({
        //         url:"https://api.yelp.com/v2/search",
        //         method:'GET',
        //         params:params
        //     }).then(function(response){
        //         console.log(response);
        //     });


        }
    }
})();



    //     }
    // }

/*tooltip.js*/

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

//location.fact.js

(function(){
    'use strict';

    angular
        .module('myApp')
        .factory('location',location);
    location.$inject = ['$http','$filter'];
    function location($http,$filter){
        var model={
            data:[], // used to store the current search result
            isZeroData:0,// 0: don't displya result 1: no return result  2: show results;
            currentIndex:0, // the current index of the page
            nextPageToken:"", // store the next page token used to query next page
            input:"", // the search input
            detail:{}, //store the results of query detail
            wikipedia:{}, // store the results of query wikipedia
            search:search,
            next:next,
            getDetail:getDetail,
            getWikipedia:getWikipedia
        };


        return model;
        // search Input
        function search(input){
            model.currentIndex = 0;
            model.input = input;
            var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=attraction+in+" +
                model.input + "&key=AIzaSyB0e53B86tTI03YQGvN6gNA5s-MwTThHHY";
            return $http.get(url)
                .then(function(response){
                    model.data = $filter('orderBy')($filter('nonagent')(response.data.results),'-rating');

                    if('next_page_token' in response.data){
                        model.nextPageToken = response.data.next_page_token;
                    }
                    else {
                        model.nextPageToken = "";
                    }
                    model.isZeroData = (response.data.results.length === 0)?1:2;
                });
        }
        // get the next list results
        function next(){
            if(model.nextPageToken !== "")
            {

                var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=attraction+in+" +
                    model.input + "&key=AIzaSyB0e53B86tTI03YQGvN6gNA5s-MwTThHHY" +  "&pagetoken=" + model.nextPageToken;

                model.currentIndex++;
                return $http.get(url)
                        .then(function(response){
                            model.data = $filter('orderBy')($filter('nonagent')(response.data.results),'-rating');

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
        // get the details of the selected attraction
        function getDetail(reference){
            var url = "https://maps.googleapis.com/maps/api/place/details/json?reference="+
            reference + "&key=AIzaSyB0e53B86tTI03YQGvN6gNA5s-MwTThHHY";
            return $http.get(url)
                .then(function(response){
                    model.detail = response.data.result;

                });
        }
        //get the wikipedia result of the selected attraction
        function getWikipedia(title){
            var url = "https://en.wikipedia.org/w/api.php?"+
            "action=query&format=json&prop=&list=search&meta=&utf8=1&srsearch="+ title +
            "&srlimit=1&srprop=sectionsnippet%7Csnippet%7Ctitlesnippet&srinterwiki=1";
            return $http.get(url)
                .then(function(response){
                    model.wikipedia = response.data.query.search[0];
                });
        }

    }
})();

//permission.fact.js

//use this service to make sure that direct access to the detail view by typing in the url

(function(){
    'use strict';

    angular
        .module('myApp')
        .factory('permission',permission);

    function permission(){
        var model ={
            isAllowed:false
        };
        return model;
    }
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
