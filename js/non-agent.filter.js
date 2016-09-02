(function(){
    'use strict';

    angular
        .module('myApp')
        .filter('nonagent',nonAgent);

    function nonAgent(){
        return exCludeAgent;

        function exCludeAgent(data){
            var out = [];
            for(var i = 0;i < data.length;i++)
            {

                if(data[i].types.indexOf("travel_agency") === -1)
                {
                    out.push(data[i]);
                }
            }

            return out;
        }
    }
})();
