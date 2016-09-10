//omnibox.dir.js

(function(){
    angular
        .module('myApp')
        .directive('omnibox',OmniBox);

    OmniBox.$inject = ['location','$rootScope','$filter','$state'];
    function OmniBox(location,$rootScope,$filter,$state){
        var directive ={
            restrict:'E',
            scope:{},
            templateUrl:"templates/omniBox.html",
            // controller:OmniboxController,
            // controllerAs:"obCtrl",
            // bindToController:true,
            link:link


        };
        return directive;
        function link(scope,element,attr){
            var vm = scope;
            vm.model = location;
            vm.SearchAttraction = SearchAttraction;
            function SearchAttraction(input){
                if(input !== '' && input !== undefined)
                {
                    vm.model.currentIndex = 0;
                    var promise = location.search(input);

                    element.find('button.searchbtnbox').toggleClass('changed');
                    promise.then(function(){
                        $state.go('attraction',{});
                        element.find('button.searchbtnbox').toggleClass('changed');
                        //element.find('button#pane-section-pagination-button-prev').addClass('pane-section-pagination-button-disabled');
                        $rootScope.$emit('setMarkers',{data:location.data});
                        $rootScope.$emit('reset',{});
                        $rootScope.$emit('setCenter',{position:{lat:location.data[0].geometry.location.lat,lng:location.data[0].geometry.location.lng}});

                    },function(error){
                        console.log(error);
                    });

                }
            }
        //     var randomString = function (length, chars) {
        //   var result = '';
        //   for (var i = length; i > 0; --i) {
        //     result += chars[Math.round(Math.random() * (chars.length - 1))];
        //   }
        //   return result;
        // };
        //     var options = {
        //         encodeSignature: true // will encode the signature following the RFC 3986 Spec by default
        //     };
        //     var params={
        //         location:'San+Jose',
        //         term:'Emma Prusch Farm Park',
        //         oauth_consumer_key:'b2G0vHIw1gVt93iGcS6oFQ',
        //         oauth_token:'GbTx68VEu2xMFz6niwbn1R1GcxMGMYCk',
        //         oauth_signature_method: "HMAC-SHA1",
        //         oauth_timestamp: new Date().getTime(),
        //         oauth_nonce: randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
        //
        //     };
        //     var ConsumerSecret = 'RRSvLYsj1-jfW9V7NqquNxcAjQg';
        //     var TokenSecret = 'E3FVhEOGrSY6RrhA68ZmpDyHf_4';
        //
        //     var oauth_signature = oauthSignature.generate('GET',"https://api.yelp.com/v2/search",params,ConsumerSecret,TokenSecret,options);
        //     params.oauth_signature = oauth_signature;
        //     $http({
        //         url:"https://api.yelp.com/v2/search",
        //         method:'GET',
        //         params:params
        //     }).then(function(response){
        //         console.log(response);
        //     });


        }
    }
})();



    //     }
    // }
