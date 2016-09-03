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
                name:'@',
                rating:'@'
            },
            // controller:SectionController,
            // controllerAs:SectCtrl,
            // bindToController:true
            link:link
        };
        function link(scope,element)
        {
            var css =  (scope.rating/5.0 * 65).toString() + 'px';
            element.find("span.nonEmptyStars").css("width",css);

        }
        return directive;


    }
})();
