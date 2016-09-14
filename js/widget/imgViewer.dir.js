/*imgViewer.dir.js*/
// image Viewer directive
(function(){
    'use strict';

    angular
        .module('app.widget')
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
