//omnibox.dir.js

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
            bindToController:true,

        };
        return directive;
    }
    OmniboxController.$inject = ['location','$http'];
    function OmniboxController(location,$http){
        var vm = this;
        vm.model = location;
        vm.SearchAttraction = SearchAttraction;
        function SearchAttraction(input){

            var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=attraction+in+" +
                input + "&key=AIzaSyB0e53B86tTI03YQGvN6gNA5s-MwTThHHY";
            $http.get(url)
                .then(function(response){
                    vm.model.data = response.data.results;
                    vm.model.isZeroData = (response.data.results.length === 0)?1:2;
                },function(error){
                    console.log(error);
                });
        }
    }
})();
