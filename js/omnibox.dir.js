(function(){
    angular
        .module('myApp')
        .directive('omnibox',OmniBox);

    function OmniBox(){
        return{
            restrict:'E',
            scope:{},
            templateUrl:"templates/omniBox.html"
        };
    }
})();
