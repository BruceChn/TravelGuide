/*imgViewer.dir.js*/
(function(){
    'use strict';

    angular
        .module('app.attraction')
        .directive('imgViewer',imgViewer);

    function imgViewer(){
        var dir = {
            restrict:'E',
            // link:link,
            templateUrl:'templates/imgViewer.html',
        };

        return dir;
    }



})();
