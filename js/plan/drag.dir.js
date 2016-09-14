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
