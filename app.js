//shared service like filter and services
angular.module('app.service',[]);
/*cross app modules*/
angular.module('app.core',[
    /*Angular modules*/
    'ngAnimate',
    /*third party*/
    'ui.router',
    /*shared service*/
    'app.service'
]);
angular.module('app.widget',[]);
angular.module('app.map',[
    'app.core',
    'app.widget'
]);
angular.module('app.attraction',[
    'app.core',
    'app.widget'
]);
angular.module('app.detail',[
    'app.core',
    'app.widget'
]);
angular.module('app.plan',[
    'app.core',
    'app.widget'
]);

angular.module('app',[
        'app.core',
        'app.widget',

        'app.map',
        'app.attraction',
        'app.detail',
        'app.plan'
]);

//app.route.js
(function(){
    'use strict';

    angular
        .module('app')
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
        authenticate.$inject = ['$q','permissionService','$state','$timeout'];
        function authenticate($q,permissionService,$state,$timeout){
            if(permissionService.isAllowed)
            {
                permissionService.isAllowed = false;
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

//attractions.directive.

(function(){
    'use strict';
    angular
        .module('app.attraction')
        .directive("attractions",Attractions);

    // define attractions directive
    Attractions.$inject = ['locationService','$rootScope','$filter','$state','$q','permissionService','eventService'];
    function Attractions(locationService,$rootScope,$filter,$state,$q,permissionService,eventService){
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

            scope.model = locationService;
            scope.event = eventService;
            scope.results = [];
            scope.currentStart = 1;
            scope.previous = previous;
            scope.next = next;
            scope.animate = animate;
            scope.stopAnimate = stopAnimate;
            scope.event.getDetail = getDetail;
            scope.event.reset = reset;

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

            function reset(){
                scope.results = [];
                scope.currentStart = 1;
            }
            // go to the previous page
            function previous(){
                scope.model.currentIndex--;
                scope.model.data = scope.results[scope.model.currentIndex];
                scope.currentStart = scope.currentStart - scope.results[scope.model.currentIndex].length;
                $rootScope.$emit('setMarkers',{data:scope.model.data});
            }
            // go to the next page
            function next(){

                // if in the last page, then go to the new page needs http request
                if(scope.model.currentIndex === (scope.results.length - 1))
                {
                    angular.element('button.searchbtnbox').toggleClass('changed');
                    angular.element('div.section-refresh-overlay').css('visibility','visible');
                    var promise = scope.model.next();
                    promise.then(function(response){

                        scope.currentStart += scope.results[scope.model.currentIndex - 1].length;
                        angular.element('button.searchbtnbox').toggleClass('changed');
                        angular.element('div.section-refresh-overlay').css('visibility','hidden');
                        $rootScope.$emit('setMarkers',{data:scope.model.data});

                    },function(error){
                        console.log(error);
                    });
                }
                else {
                    scope.model.currentIndex++;
                    scope.model.data = scope.results[scope.model.currentIndex];
                    scope.currentStart += scope.results[scope.model.currentIndex - 1].length;
                    $rootScope.$emit('setMarkers',{data:scope.model.data});
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
                // var photo_id = ('photos' in scope.results[pageIndex][index]) ?scope.results[pageIndex][index].photos[0].photo_reference:"unavailable";
                $rootScope.$emit('setMapCenter',{geolocation:scope.results[pageIndex][index].geometry.location});
                var promise1 = scope.model.getDetail(scope.results[pageIndex][index].place_id);
                var promise2 = scope.model.getWikipedia(scope.results[pageIndex][index].name);
                $q.all([promise1,promise2]).then(function(){

                    angular.element('div.section-refresh-overlay').css('visibility','hidden');
                    angular.element('button.searchbtnbox').toggleClass('changed');
                    permissionService.isAllowed = true;
                    $state.go('detail',{pageIndex:pageIndex,index:index});
                });

            }

        }
    }

    AttractionController.$inject = ['locationService','$http'];
    function AttractionController(locationService,$http){
        var vm = this;
        vm.model = locationService;
    }
})();

/*attractionSection.dir.js*/

(function(){
    'use strict';

    angular
        .module('app.attraction')
        .directive('attractionSection',attractionSection);

    attractionSection.$inject = ['locationService','$http','$window'];
    function attractionSection(locationService,$http,$window){
        var directive = {
            restrict:'E',
            templateUrl:"templates/attractionSection.html",
            scope:{
                name:'@',
                rating:'@',
                address:'@',
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
            scope.model = locationService;
            scope.show = show;
            var css =  (scope.rating/5.0 * 65).toString() + 'px';
            element.find("span.nonEmptyStars").css("width",css);
            scope.index = parseInt(attr.index);

            if ('photos' in scope.model.data[parseInt(attr.index)]){
                //var photo_reference = scope.model.data[parseInt(attr.index)].photos[0].photo_reference;
                var url = scope.model.data[parseInt(attr.index)].photos[0].getUrl({maxWidth:80});

                element.find("img.attraction_img").attr('src',url);

            }
            else {
                element.find("img.attraction_img").attr('src',"img/img_not_available.jpg");
            }
            function show(){

                var img = new Image();
                if ('photos' in scope.model.data[parseInt(attr.index)]){

                    img.src= scope.model.data[parseInt(attr.index)].photos[0].getUrl({maxWidth:$window.innerWidth * 0.9});
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
    // SectionController.$inject = ['location'];


        // var vm = this;
        // this.url = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=80&photoreference="+
        // location.data.photo_reference+
        // "&key=AIzaSyB0e53B86tTI03YQGvN6gNA5s-MwTThHHY";
        // $http.get



})();

//omnibox.dir.js

(function(){
    angular
        .module('app.attraction')
        .directive('omnibox',OmniBox);

    OmniBox.$inject = ['locationService','$rootScope','$filter','$state','eventService'];
    function OmniBox(locationService,$rootScope,$filter,$state,eventService){
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
            vm.model = locationService;
            vm.event = eventService;
            vm.SearchAttraction = SearchAttraction;
            function SearchAttraction(input){
                if(input !== '' && input !== undefined)
                {
                    vm.model.currentIndex = 0;
                    element.find('button.searchbtnbox').toggleClass('changed');
                    var promise = vm.model.search(input);


                    promise.then(function(){
                        $state.go('attraction',{});
                        element.find('button.searchbtnbox').toggleClass('changed');
                        //element.find('button#pane-section-pagination-button-prev').addClass('pane-section-pagination-button-disabled');
                        $rootScope.$emit('setMarkers',{data:vm.model.data});
                        vm.event.reset();
                        $rootScope.$emit('setCenter',{geolocation:{lat:vm.model.data[0].geometry.location.lat(),lng:vm.model.data[0].geometry.location.lng()}});

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

// searchCtrl.ctrl.js

(function(){
    'use strict';

    angular
        .module('app.attraction')
        .controller('SearchController',SearchController);

    SearchController.$inject = ['locationService'];
    function SearchController(locationService){
        var vm = this;
        vm.model = locationService;
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
                $rootScope.$emit('setCenter',{geolocation:{lat:scope.model.data[0].geometry.location.lat(),lng:scope.model.data[0].geometry.location.lng()}});
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
                    scope.photo_reference= "available";
                else {
                    scope.photo_reference = "unavailable";
                }

                if(scope.photo_reference !== "unavailable")
                {
                    url = scope.model.detail.photos[0].getUrl({maxWidth:408});
                }
                else
                {
                    url = "img/img_not_available.jpg";
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
                    photoUrl =  scope.model.detail.photos[i].getUrl({maxWidth:408});
                    scope.photos.push(photoUrl);
                }
                photoUrl =  scope.model.detail.photos[0].getUrl({maxWidth:408});
                scope.photos.push(photoUrl);
            }

        }
        return directive;
    }
})();

//mapCtrl.ctrl.js
(function(){
    'use strict';
    angular
        .module('app.map')
        .controller('MapController',MapController);

    //var map = new google.maps.Map(document.getElementById('map'),mapOptions);

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
            for(var i = 0;i < data.length;i++){
                var myLatLng={lat:data[i].geometry.location.lat(),lng:data[i].geometry.location.lng()};
                var marker = new google.maps.Marker({
                    position:myLatLng,
                });
                marker.addListener('click',(function(i){
                    return function(){
                        vm.event.getDetail(vm.model.currentIndex,i);
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

(function(){
    'use strict';
    angular
        .module('app.service')
        .factory('eventService',eventService);

    function eventService(){
        var model = {
            getDetail:{},
            reset:{}
        };
        return model;
    }
})();

//location.fact.js

(function(){
    'use strict';

    angular
        .module('app.service')
        .factory('locationService',locationService);
    locationService.$inject = ['$http','$filter','$q','$timeout'];
    function locationService($http,$filter,$q,$timeout){
        var model={
            data:[], // used to store the current search result
            isZeroData:0,// 0: don't displya result 1: no return result  2: show results;
            currentIndex:0, // the current index of the page
            pagination:{}, // store the next page token used to query next page
            input:"", // the search input
            detail:{}, //store the results of query detail
            wikipedia:{}, // store the results of query wikipedia
            map:{},
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
            var request ={
                query:'attraction in'+input
            };
            var service = new google.maps.places.PlacesService(model.map);
            model.defer = $q.defer();
            service.textSearch(request,callback);
            return model.defer.promise;

        }
        // get the next list results
        function next(){
            model.defer = $q.defer();
            if(model.pagination.hasNextPage)
            {
                model.currentIndex++;
                model.pagination.nextPage();

            }
            return model.defer.promise;
        }
        // get the details of the selected attraction
        function getDetail(id){

            var service = new google.maps.places.PlacesService(model.map);
            model.defer = $q.defer();
            var request = {
                placeId:id
            };
            service.getDetails(request,callback);
            function callback(place,status){
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    model.detail = place;
                    model.defer.resolve();
                }
                else{
                    model.defer.reject("can't find the place details");
                }
            }
            return model.defer.promise;
        }
        //get the wikipedia result of the selected attraction
        function getWikipedia(title){
            var url = "https://en.wikipedia.org/w/api.php?"+
            "action=query&format=json&prop=&list=search&meta=&utf8=1&srsearch="+ title +
            "&srlimit=1&srprop=sectionsnippet%7Csnippet%7Ctitlesnippet&srinterwiki=1&callback=JSON_CALLBACK";
            return $http.jsonp(url)
                .then(function(response){
                    model.wikipedia = response.data.query.search[0];
                });
        }
        function callback(results,status,pagination){

            if (status == google.maps.places.PlacesServiceStatus.OK) {

                model.data = $filter('orderBy')($filter('nonagent')(results),'-rating');

                model.pagination = pagination;


                model.isZeroData = (results.length === 0)?1:2;
                model.defer.resolve();
            }
            else {
                model.defer.reject("Can't get the result");
            }


        }



    }
})();

//nonAgent.filter.js

// filter used to eliminate the travel_agency results from google search
//update: used it to eliminate non-rating results also
(function(){
    'use strict';

    angular
        .module('app.service')
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

//permission.fact.js

//use this service to make sure that direct access to the detail view by typing in the url

(function(){
    'use strict';

    angular
        .module('app.service')
        .factory('permissionService',permissionService);

    function permissionService(){
        var model ={
            isAllowed:false
        };
        return model;
    }
})();

/*imgViewer.dir.js*/
(function(){
    'use strict';

    angular
        .module('app.widget')
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

/*tooltip.js*/

(function(){
    'use strict';
    angular
        .module('app.widget')
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
