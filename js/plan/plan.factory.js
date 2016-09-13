//plan.factory.js

(function(){
    'use strict';

    angular
        .module('app.plan')
        .factory('planService',planService);

    planService.$inject = ['storageService'];
    function planService(storageService){
        var createdPlans = storageService.items;
        var model={
            current:[],
            selected:[],
            save:save,
            createdPlans:createdPlans,
            clear:clear
        };
        return model;

        function save(title){
            var names = [];
            for(var i = 0;i < model.selected.length;i++)
            {
                names.push(model.selected[i].name);
            }
            storageService.setItem(title,names);
        }

        function clear(){
            storageService.clear();
        }
    }
})();
