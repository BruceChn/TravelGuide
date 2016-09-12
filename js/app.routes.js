//app.route.js
(function(){
    'use strict';

    angular
        .module('app')
        .config(config);
    function config($stateProvider,$urlRouterProvider)
    {
        $urlRouterProvider
            .otherwise('/');
        $stateProvider
            .state('attraction',{
                url:'/',
                template:'<attractions show = "SearchCtrl.show" class = "attractions-container"></attractions>'

            })
            .state('detail',{
                url:'/:pageIndex/:index',
                template:'<detail index ="detailCtrl.index"><detail>',
                controller:detailController,
                controllerAs:'detailCtrl',
                resolve:{
                    authenticate:authenticate
                }
            });
        authenticate.$inject = ['$q','permissionService','$state','$timeout'];
        function authenticate($q,permissionService,$state,$timeout){
            if(permissionService.isAllowed)
            {
                permissionService.isAllowed = false;
                return $q.when();
            }
            else {
                $timeout(function(){
                    $state.go('attraction');
                });
                return $q.reject();

            }
        }
    }

    detailController.$inject = ['$stateParams'];
    function detailController($stateParams,location){
        var vm = this;
        vm.pageIndex = $stateParams.pageIndex;
        vm.index = $stateParams.index;

    }

})();
