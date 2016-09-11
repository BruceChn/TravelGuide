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
