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
