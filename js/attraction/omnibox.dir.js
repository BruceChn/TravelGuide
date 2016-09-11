//omnibox.dir.js

(function(){
    angular
        .module('app.attraction')
        .directive('omnibox',OmniBox);

    OmniBox.$inject = ['locationService','$rootScope','$filter','$state','eventService'];
    function OmniBox(locationService,$rootScope,$filter,$state,eventService){
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
            vm.model = locationService;
            vm.event = eventService;
            vm.SearchAttraction = SearchAttraction;
            function SearchAttraction(input){
                if(input !== '' && input !== undefined)
                {
                    vm.model.currentIndex = 0;
                    element.find('button.searchbtnbox').toggleClass('changed');
                    var promise = vm.model.search(input);


                    promise.then(function(){
                        $state.go('attraction',{});
                        element.find('button.searchbtnbox').toggleClass('changed');
                        //element.find('button#pane-section-pagination-button-prev').addClass('pane-section-pagination-button-disabled');
                        $rootScope.$emit('setMarkers',{data:vm.model.data});
                        vm.event.reset();
                        $rootScope.$emit('setCenter',{geolocation:{lat:vm.model.data[0].geometry.location.lat(),lng:vm.model.data[0].geometry.location.lng()}});

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
