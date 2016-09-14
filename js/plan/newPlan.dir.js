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
                if(typeof title === 'undefined' && title === '' )
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
