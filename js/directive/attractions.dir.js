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
