(function(){
    'use strict';

    angular
        .module('myApp')
        .controller('SearchController',SearchController);

    SearchController.$inject = ['location'];
    function SearchController(location){
        var vm = this;
        vm.model = location;
        vm.show = true;
        vm.toggle = toggle;

        function toggle(){
            vm.show = !vm.show;
            if(!vm.show)
            {
                angular.element('.pane-toggle-button-container').css('left','0px');
                angular.element('.pane-toggle-button').css('transform','scaleX(-1)');
            }
            else
            {
                angular.element('.pane-toggle-button-container').css('left','100%');
                angular.element('.pane-toggle-button').css('transform','scaleX(1)');
            }
        }

    }
})();
