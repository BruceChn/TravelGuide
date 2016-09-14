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
angular.module('app.widget',['ngAnimate']);

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
                template:'<detail index ="detailCtrl.index"><detail>',
                controller:DetailController,
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

    DetailController.$inject = ['$stateParams'];
    function DetailController($stateParams){
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
            scope.permission = permissionService;
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
                scope.model.results = [];
                scope.model.currentStart = 1;
            }
            // go to the previous page
            function previous(){
                scope.model.currentIndex--;
                scope.model.data = scope.model.results[scope.model.currentIndex];
                scope.model.currentStart = scope.model.currentStart - scope.model.results[scope.model.currentIndex].length;
                $rootScope.$emit('setMarkers',{data:scope.model.data});
            }
            // go to the next page
            function next(){

                // if in the last page, then go to the new page needs http request
                if(scope.model.currentIndex === (scope.model.results.length - 1))
                {
                    angular.element('button.searchbtnbox').toggleClass('changed');
                    angular.element('div.section-refresh-overlay').css('visibility','visible');
                    var promise = scope.model.next();
                    promise.then(function(response){

                        scope.model.currentStart += scope.model.results[scope.model.currentIndex - 1].length;
                        angular.element('button.searchbtnbox').toggleClass('changed');
                        angular.element('div.section-refresh-overlay').css('visibility','hidden');
                        $rootScope.$emit('setMarkers',{data:scope.model.data});

                    },function(error){
                        console.log(error);
                    });
                }
                else {
                    scope.model.currentIndex++;
                    scope.model.data = scope.model.results[scope.model.currentIndex];
                    scope.model.currentStart += scope.model.results[scope.model.currentIndex - 1].length;
                    $rootScope.$emit('setMarkers',{data:scope.model.data});
                }
            }
            //start the drop animation on certain mark
            function animate(index){
                $rootScope.$emit('setAnimation',{index:index});
            }
            //stop the animation
            function stopAnimate(index){
                $rootScope.$emit('stopAnimation',{index:index});
            }
            //
            function getDetail(pageIndex,index){
                //when in new plan mode, enter the detail page is not allowed
                if(scope.permission.planMode) return;
                angular.element('button.searchbtnbox').toggleClass('changed');
                angular.element('div.section-refresh-overlay').css('visibility','visible');
                // var photo_id = ('photos' in scope.results[pageIndex][index]) ?scope.results[pageIndex][index].photos[0].photo_reference:"unavailable";
                $rootScope.$emit('setMapCenter',{geolocation:scope.model.results[pageIndex][index].geometry.location});
                var promise1 = scope.model.getDetail(scope.model.results[pageIndex][index].place_id);
                var promise2 = scope.model.getWikipedia(scope.model.results[pageIndex][index].name);
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

    attractionSection.$inject = ['locationService','$http','$window','permissionService','FlashService'];
    function attractionSection(locationService,$http,$window,permissionService,FlashService){
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
            //initiation process
            function activate(){
                setImg();
            }
            //set the displayed image
            function setImg(){
                var css =  (scope.rating/5.0 * 65).toString() + 'px';
                element.find("span.nonEmptyStars").css("width",css);

                //sometimes returned result doesnt include photo property
                if ('photos' in scope.model.data[scope.index]){

                    var url = scope.model.data[scope.index].photos[0].getUrl({maxWidth:80});
                    element.find("img.attraction_img").attr('src',url);
                }
                else {
                    element.find("img.attraction_img").attr('src',"img/img_not_available.jpg");
                }
            }
            //image Viewer Zoom in the selected image
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
                    FlashService.create("Sorry,the image is not available!");
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

//omnibox.dir.js
//the searchbox directive
(function(){
    angular
        .module('app.attraction')
        .directive('omnibox',OmniBox);

    OmniBox.$inject = ['locationService','$rootScope','$filter','$state','eventService','permissionService','planService','FlashService'];
    function OmniBox(locationService,$rootScope,$filter,$state,eventService,permissionService,planService,FlashService){
        var directive ={
            restrict:'E',
            scope:{},
            templateUrl:"templates/omniBox.html",
            controller:OmniboxController,
            controllerAs:"obCtrl",
            bindToController:true,
            link:link


        };
        return directive;
        function link(scope,element,attr,ctrl){
            var vm = scope;
            vm.model = locationService;
            vm.event = eventService;
            vm.plan = planService;
            vm.permission = permissionService;
            vm.searchAttraction = searchAttraction;
            vm.enterPlanMode = enterPlanMode;
            vm.viewPlan = viewPlan;
            vm.clear = clear;
            //search attractions based on input;
            function searchAttraction(input){

                if(typeof input !== 'undefined' && input !== '')
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
                else {
                    FlashService.create('The input cannot be empty!');
                }
            }
            // create new plan mode
            function enterPlanMode(){
                vm.permission.planMode = true;
                vm.permission.endHint = false;
                angular.copy(vm.model.data,vm.plan.current);

                for(var i = 0;i < vm.plan.current.length;i++)
                {
                    vm.plan.current[i].id = i;
                    vm.plan.current[i].isSelected = false;
                }

                angular.element('.plan-overlay').css('visibility','visible');

            }
            // clear all existed plans
            function clear(){
                vm.plan.clear();

            }
            //view selected plans
            function viewPlan(title){

                vm.model.currentIndex = 0;
                element.find('button.searchbtnbox').toggleClass('changed');
                var promise = vm.model.loadAttraction(vm.plan.createdPlans[title]);
                promise.then(function(){
                    ctrl.input = title;
                    $state.go('attraction',{});
                    element.find('button.searchbtnbox').toggleClass('changed');
                    $rootScope.$emit('setMarkers',{data:vm.model.data});
                    vm.event.reset();
                    $rootScope.$emit('setCenter',{geolocation:{lat:vm.model.data[0].geometry.location.lat(),lng:vm.model.data[0].geometry.location.lng()}});
                    vm.model.isZeroData = 2;
                });
                
            }
        }
    }
    OmniboxController.$injec = ['$scope'];
    function OmniboxController($scope){
        var vm = this;
    }
})();

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
        //collapse and expand the panel
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
                index:'='
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
            // return attracton page
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
                if('photos' in scope.model.data[scope.index])
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
                if('photos' in scope.model.detail)
                {
                    for(var i = 1;i < scope.model.detail.photos.length;i++)
                    {
                        photoUrl =  scope.model.detail.photos[i].getUrl({maxWidth:408});
                        scope.photos.push(photoUrl);
                    }
                    photoUrl =  scope.model.detail.photos[0].getUrl({maxWidth:408});
                    scope.photos.push(photoUrl);
                }
                else
                {
                    console.log("ishere");
                    scope.photos.push('img/img_not_available.jpg');
                }
            }

        }
        return directive;
    }
})();

//mapCtrl.ctrl.js
//deal with the map manipulation
(function(){
    'use strict';
    angular
        .module('app.map')
        .controller('MapController',MapController);

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
            data.map(function(result,i)
            {
                var myLatLng={lat:result.geometry.location.lat(),lng:result.geometry.location.lng()};
                var marker = new google.maps.Marker({
                    position:myLatLng,
                });
                marker.addListener('click',(function(i){
                    return function(){
                        vm.event.getDetail(vm.model.currentIndex,i);
                    };
                })(i));
                vm.markers.push(marker);
            });



            setAllMarkers(map);
        }
        function setAllMarkers(map){
            vm.markers.map(function(marker)
            {
                marker.setMap(map);
            });

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

//drag.directive.js
// nake a element draggable
(function(){
    'use strict';

    angular
        .module('app.plan')
        .directive('draggable',draggable);

    function draggable(){
        var directive = {
            restrict:'A',
            link:link,
            require:'attractionSection'
        };

        return directive;
        function link(scope,element,attr,ctrl){
            var el = element[0];
            el.draggable = true;
            el.addEventListener(
                'dragstart',
                function(e){
                    e.dataTransfer.effectAllowed ='move';
                    e.dataTransfer.setData('id',ctrl.index);
                    this.classList.add('drag');
                    return false;
                },
                false
            );
            el.addEventListener(
                'dragend',
                function(e){
                    this.classList.remove('drag');
                    return false;
                },
                false
            );
        }
    }
})();

//drop.directive.js
// make an element droppable
(function(){
    'use strict';

    angular
        .module('app.plan')
        .directive('droppable',droppable);

    droppable.$inject=['planService','permissionService'];
    function droppable(planService,permissionService){
        var directive = {
            restrict:'A',
            link:link
        };

        return directive;

        function link(scope,element){
            var el = element[0];
            scope.plan =  planService;
            scope.permission = permissionService;
            el.addEventListener(
                'dragover',
                function(e){
                    e.dataTransfer.dropEffect = 'move';
                    if(e.preventDefault)
                        e.preventDefault();
                    this.classList.add('over');
                    return false;
                },
                false
            );
            el.addEventListener(
                'dragenter',
                function(e) {
                    this.classList.add('over');
                    return false;
                },
                false
            );

            el.addEventListener(
                'dragleave',
                function(e) {
                    this.classList.remove('over');
                    return false;
                },
                false

            );
            el.addEventListener(
                'drop',
                function(e){
                    if(e.stopPropagation)
                        e.stopPropagation();
                    this.classList.remove('over');
                    var id = e.dataTransfer.getData('id');
                    scope.permission.endHint = true;
                    scope.plan.current[id].isSelected = true;
                    scope.plan.selected.push(scope.plan.current[id]);
                }
            );
        }
    }
})();

//newPlan.dir.js
(function(){
    'use strict';

    angular
        .module('app.plan')
        .directive('newPlan',newPlan);

    newPlan.$inject = ['locationService','planService','permissionService','FlashService'];
    function newPlan(locationService,planService,permissionService,FlashService){
        var directive ={
            restrict:'E',
            link:link,
            templateUrl:"templates/newPlan.html"
        };
        return directive;

        function link(scope,element){
            scope.plan = planService;
            scope.location = locationService;
            scope.permission = permissionService;
            scope.cancel = cancel;
            scope.save = save;
            scope.cancelSelected = cancelSelected;

            //cancel the creation operation
            function cancel(){
                scope.permission.planMode = false;
                angular.element('.plan-overlay').css('visibility','hidden');
                scope.plan.current = [];
                scope.plan.selected = [];
            }

            //remove the selected attractions
            function cancelSelected(id,id2){
                scope.plan.current[id].isSelected = false;
                scope.plan.selected.splice(id2,1);
            }
            //save the selected attractions
            function save(title){
                if(typeof title === 'undefined' || title === '' )
                {
                    FlashService.create("the title can't be empty!");
                }
                else if(scope.plan.selected.length === 0){
                    FlashService.create("the content cannot be empty!");
                }
                else{

                    scope.permission.planMode = false;
                    angular.element('.plan-overlay').css('visibility','hidden');
                    scope.plan.save(title);
                    scope.plan.current = [];
                    scope.plan.selected = [];
                }
            }


        }
    }
})();

//plan.factory.js
//used to store the plan infomation
(function(){
    'use strict';

    angular
        .module('app.plan')
        .factory('planService',planService);

    planService.$inject = ['storageService'];
    function planService(storageService){

        var model={
            current:[],//store the unselected plans
            selected:[],//Store the selected plans
            save:save,
            createdPlans:storageService.items, // get the created plans from storageService(Local storage)
            clear:clear
        };
        return model;
        //save the created plan
        function save(title){
            var names = [];
            model.selected.map(function(selected){
                names.push(selected.name);
            });


            storageService.setItem(title,names);

        }
        //clear all the selected plans
        function clear(){
            storageService.clear();
            model.createdPlans = storageService.items;
        }
    }
})();

//event.factory.js
//moved the registered rootScope event to event Service to avoid the duplicate event registeration
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
//this service is used to get the data and store data.

(function(){
    'use strict';

    angular
        .module('app.service')
        .factory('locationService',locationService);
    locationService.$inject = ['$http','$filter','$q','$timeout'];
    function locationService($http,$filter,$q,$timeout){
        var model={
            data:[],// used to store the current search result
            results:[], //used to store all the results
            isZeroData:0,// 0: don't displya result 1: no return result  2: show results;
            currentIndex:0, // the current index of the page
            currentStart:1,
            pagination:{}, // store the next page token used to query next page
            input:"", // the search input
            detail:{}, //store the results of query detail
            wikipedia:{}, // store the results of query wikipedia
            map:{},
            search:search,
            next:next,
            getDetail:getDetail,
            getWikipedia:getWikipedia,
            loadAttraction:loadAttraction

        };


        return model;
        //use stored the names of attractions in created plan to get results;
        function loadAttraction(names){

            model.promises = [];
            var newData = [];
            var service = new google.maps.places.PlacesService(model.map);
            names.map(function(name)
            {
                var defer = $q.defer();
                model.promises.push(defer.promise);
                var request = {
                    query:name
                };

                service.textSearch(request,(function(defer){

                    return function(results,status,pagination){
                        if (status == google.maps.places.PlacesServiceStatus.OK) {

                            newData.push(results[0]);
                            model.pagination = pagination;

                            defer.resolve();
                        }
                        else {
                            defer.reject("Can't get the result");
                        }
                    };
                })(defer));
            });
            return  $q.all(model.promises).then(function(){
                model.data = newData;
            });
        }
        /// search Input
        function search(input){
            model.currentIndex = 0;
            model.input = input;

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
            isAllowed:false, //determine if it is allowed to enter the detail route view
            planMode:false, //decide if it is the planMode
            endHint:false
        };
        return model;
    }
})();

//storage.factory.js
//load data from localstorage when the application loaded and store the plan data back to localStorage when the application is unloaded
(function(){
    'use strict';

    angular
        .module("app.service")
        .factory('storageService',storageService);
    storageService.$inject = ['storageKey','$window','$exceptionHandler'];
    function storageService(storageKey,$window,$exceptionHandler){

        var items = loadData();
        var model = {
            items:items,
            getItem: getItem,
            setItem: setItem,
            getKeys: getKeys,
            clear:clear
        };
        $window.addEventListener('beforeunload',persistData);
        return model;

        function loadData(){
            try{
                if(storageKey in $window.localStorage)
                {
                    var data = $window.localStorage.getItem(storageKey);
                    $window.localStorage.removeItem(storageKey);
                    return (angular.extend({},angular.fromJson(data)));
                }

            } catch ( localStorageError ) {
                $exceptionHandler( localStorageError );
            }
            return ({});
        }
        function clear(){
            items = {};
            model.items = items;
        }
        function getKeys(){

            return Object.keys(items);
        }
        function setItem(key,value){
            items[key] = angular.copy(value);
        }
        function getItem(key)
        {
            return (key in items)?angular.copy(items[key]):null;
        }
        function persistData()
        {
            try {
                $window.localStorage.setItem( storageKey, angular.toJson( items ) );
            } catch ( localStorageError ) {
                $exceptionHandler( localStorageError );
            }
        }
    }
})();

//storageKey.value.js
(function(){

    angular
        .module('app.service')
        .value('storageKey',"angularjs_travel_plan");
})();

//flash.dir.js
//Flash meassage widget
(function(){
    'use strict';

    angular
        .module('app.widget')
        .directive('flash',flash);
    flash.$inject = ['FlashService'];
    function flash(FlashService)
    {
        var dir = {

            restrict:'E',
            templateUrl:'templates/flash.html',
            link:link

        };
        function link(scope){
            scope.flash = FlashService;
        }
        return dir;

    }
})();

//flashService.factorty.js
//used to manipulate the flash data
(function(){
    'use strict';

    angular
        .module('app.widget')
        .factory('FlashService',FlashService);

    FlashService.$inject = ['$timeout','$rootScope'];
    function FlashService($timeout,$rootScope){

        var dataFactory = {
            create:create,
            dismiss:dismiss,
            flash:{
                text:'',
                timeout:5000
            },
            hasFlash:false
        },
        timeout;
        function create(text){
            $timeout.cancel(timeout);
            dataFactory.flash.text = text;

            dataFactory.hasFlash = true;
            timeout = $timeout(function(){
                dataFactory.dismiss();
            },dataFactory.flash.timeout);
        }
        function dismiss() {
            $timeout.cancel(timeout);
            $timeout(function() {
                dataFactory.hasFlash = false;
            });
        }
        return dataFactory;
    }
})();

/*imgViewer.dir.js*/
// image Viewer directive
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

/*tooltip.directive.js*/
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
