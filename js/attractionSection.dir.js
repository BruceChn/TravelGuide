(function(){
    'use strict';

    angular
        .module('myApp')
        .directive('attractionSection',attractionSection);

    function attractionSection(){
        var directive = {
            restrict:'E',
            templateUrl:"templates/attractionSection.html",
            scope:{
                name:'@'
            }
            // controller:SectionController,
            // controllerAs:SectCtrl,
            // bindToController:true
        };
        return directive;


    }
})();
