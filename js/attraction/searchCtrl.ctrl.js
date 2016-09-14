// searchCtrl.ctrl.js

(function(){
    'use strict';

    angular
        .module('app.attraction')
        .controller('SearchController',SearchController);

    SearchController.$inject = ['locationService'];
    function SearchController(locationService){
        var vm = this;
        vm.model = locationService;
        vm.show = true;
        vm.toggle = toggle;
        //collapse and expand the panel
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
