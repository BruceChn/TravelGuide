//storage.factory.js
(function(){
    'use strict';

    angular
        .module("app.service")
        .factory('storageService',storageService);
    storageService.$inject = ['storageKey','$window','$exceptionHandler'];
    function storageService(storageKey,$window,$exceptionHandler){

        var items = loadData();
        var model = {
            items:items,
            getItem: getItem,
            setItem: setItem,
            getKeys: getKeys,
            clear:clear
        };
        $window.addEventListener('beforeunload',persistData);
        return model;

        function loadData(){
            try{
                if(storageKey in $window.localStorage)
                {
                    var data = $window.localStorage.getItem(storageKey);
                    $window.localStorage.removeItem(storageKey);
                    return (angular.extend({},angular.fromJson(data)));
                }

            } catch ( localStorageError ) {
                $exceptionHandler( localStorageError );
            }
            return ({});
        }
        function clear(){
            items = {};
        }
        function getKeys(){

            return Object.keys(items);
        }
        function setItem(key,value){

            items[key] = angular.copy(value);

        }
        function getItem(key)
        {
            return (key in items)?angular.copy(items[key]):null;
        }
        function persistData()
        {
            try {
                $window.localStorage.setItem( storageKey, angular.toJson( items ) );
            } catch ( localStorageError ) {
                $exceptionHandler( localStorageError );
            }
        }
    }
})();
