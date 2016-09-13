//newPlan.dir.js
(function(){
    'use strict';

    angular
        .module('app.plan')
        .directive('newPlan',newPlan);

    newPlan.$inject = ['locationService','planService','permissionService'];
    function newPlan(locationService,planService,permissionService){
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


            function cancel(){
                scope.permission.planMode = false;
                angular.element('.plan-overlay').css('visibility','hidden');
                scope.plan.current = [];
                scope.plan.selected = [];
            }

            function cancelSelected(id,id2){
                scope.plan.current[id].isSelected = false;
                scope.plan.selected.splice(id2,1);
            }
            function save(title){
                if(scope.plan.selected.length === 0 || typeof title === 'undefined' )
                {
                    console.log("ishere");
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
