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
            var button = angular.element('.pane-toggle-button');
            if(!vm.show)
            {
                angular.element('.pane-toggle-button-container').css('left','0px');

                button.css('transform','scaleX(-1)');
                button.attr('data-original-title','expand side pane');

            }
            else
            {
                angular.element('.pane-toggle-button-container').css('left','100%');
                button.css('transform','scaleX(1)');
                button.attr('data-original-title','collapse side pane');

            }
        }

    }
})();
