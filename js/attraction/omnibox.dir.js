//omnibox.dir.js

(function(){
    angular
        .module('app.attraction')
        .directive('omnibox',OmniBox);

    OmniBox.$inject = ['locationService','$rootScope','$filter','$state','eventService','permissionService','planService'];
    function OmniBox(locationService,$rootScope,$filter,$state,eventService,permissionService,planService){
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
            vm.permission = permissionService;
            vm.searchAttraction = searchAttraction;
            vm.enterPlanMode = enterPlanMode;
            vm.plan = planService;
            function searchAttraction(input){
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
        }
    }
})();
