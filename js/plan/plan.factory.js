//plan.factory.js
//used to store the plan infomation
(function(){
    'use strict';

    angular
        .module('app.plan')
        .factory('planService',planService);

    planService.$inject = ['storageService'];
    function planService(storageService){

        var model={
            current:[],//store the unselected plans
            selected:[],//Store the selected plans
            save:save,
            createdPlans:storageService.items, // get the created plans from storageService(Local storage)
            clear:clear
        };
        return model;
        //save the created plan
        function save(title){
            var names = [];
            model.selected.map(function(selected){
                names.push(selected.name);
            });


            storageService.setItem(title,names);
        }
        //clear all the selected plans
        function clear(){
            storageService.clear();
            model.createdPlans = {};
        }
    }
})();
