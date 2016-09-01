(function(){
    angular
        .module('myApp')
        .directive('omnibox',OmniBox);

    function OmniBox(){
        var directive ={
            restrict:'E',
            scope:{},
            templateUrl:"templates/omniBox.html",
            controller:OmniboxController,
            controllerAs:"obCtrl",
            bindToController:true
        };
        return directive;
    }
    OmniboxController.$inject = ['location'];
    function OmniboxController(location){
        var vm = this;
        vm.model = location;
        vm.SearchAttraction = SearchAttraction;
        
        function SearchAttraction(input){
            console.log(input);
        }
    }
})();
