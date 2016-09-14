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
