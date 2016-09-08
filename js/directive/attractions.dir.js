//attractions.directive.

(function(){
    'use strict';
    angular
        .module('myApp')
        .directive("attractions",Attractions);

    // define attractions directive
    Attractions.$inject = ['location','$rootScope','$filter'];
    function Attractions(location,$rootScope,$filter){
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
            scope.animate = animate;
            scope.stopAnimate = stopAnimate;
            scope.model.data = scope.results[scope.model.currentIndex];
            activate();
            function activate(){
                // if in the first page , disable the previous button
                if(scope.model.currentIndex === 0)
                {
                    element.find('button#pane-section-pagination-button-prev').addClass('pane-section-pagination-button-disabled');
                }
                else {
                    element.find('button#pane-section-pagination-button-prev').removeClass('pane-section-pagination-button-disabled');
                }

            }
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
                $rootScope.$emit('setMarkers',{data:$filter('orderBy')($filter('nonagent')(location.data),'-rating')});
            }
            // go to the next page
            function next(){

                // if in the last page, then go to the new page needs http request
                if(scope.model.currentIndex === (scope.results.length - 1))
                {
                    angular.element('div.section-refresh-overlay').css('visibility','visible');
                    var promise = location.next();
                    promise.then(function(response){

                        scope.currentStart += scope.results[scope.model.currentIndex - 1].length;
                        angular.element('div.section-refresh-overlay').css('visibility','hidden');
                        $rootScope.$emit('setMarkers',{data:$filter('orderBy')($filter('nonagent')(location.data),'-rating')});

                    },function(error){
                        console.log(error);
                    });
                }
                else {
                    scope.model.currentIndex++;
                    scope.model.data = scope.results[scope.model.currentIndex];
                    scope.currentStart += scope.results[scope.model.currentIndex - 1].length;
                    $rootScope.$emit('setMarkers',{data:$filter('orderBy')($filter('nonagent')(location.data),'-rating')});
                }
            }
            function animate(index){
                $rootScope.$emit('setAnimation',{index:index});
            }
            function stopAnimate(index){
                $rootScope.$emit('stopAnimation',{index:index})
            }

        }
    }

    AttractionController.$inject = ['location'];
    function AttractionController(location){
        var vm = this;
        vm.model = location;
    }
})();
