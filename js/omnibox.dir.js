//omnibox.dir.js

(function(){
    angular
        .module('myApp')
        .directive('omnibox',OmniBox);

    function OmniBox(){
        var directive ={
            restrict:'E',
            scope:{},
            templateUrl:"templates/omniBox.html",
            controller:OmniboxController,
            controllerAs:"obCtrl",
            bindToController:true,

        };
        return directive;
    }
    OmniboxController.$inject = ['location','$http'];
    function OmniboxController(location,$http){
        var vm = this;
        vm.model = location;
        vm.SearchAttraction = SearchAttraction;
        function randomString(length, chars) {
                var result = '';
                for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
                return result;
        }
        function SearchAttraction(input){

            var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=attraction+in+" +
                input + "&key=AIzaSyB0e53B86tTI03YQGvN6gNA5s-MwTThHHY";
            $http.get(url)
                .then(function(response){
                    vm.model.data = response.data.results;
                    vm.model.isZeroData = (response.data.results.length === 0)?1:2;
                },function(error){
                    console.log(error);
                });
            // var options = {
            //     encodeSignature: true // will encode the signature following the RFC 3986 Spec by default
            // };
            // var params={
            //     location:'San+Jose',
            //     term:'Emma Prusch Farm Park',
            //     oauth_consumer_key:'b2G0vHIw1gVt93iGcS6oFQ',
            //     oauth_token:'GbTx68VEu2xMFz6niwbn1R1GcxMGMYCk',
            //     oauth_signature_method: "HMAC-SHA1",
            //     oauth_timestamp: new Date().getTime(),
            //     oauth_nonce: randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
            //
            // };
            // var ConsumerSecret = 'RRSvLYsj1-jfW9V7NqquNxcAjQg';
            // var TokenSecret = 'E3FVhEOGrSY6RrhA68ZmpDyHf_4';
            //
            // var oauth_signature = oauthSignature.generate('GET',"https://api.yelp.com/v2/search",params,ConsumerSecret,TokenSecret,options);
            // params.oauth_signature = oauth_signature;
            // $http({
            //     url:"https://api.yelp.com/v2/search",
            //     method:'GET',
            //     params:params
            // }).then(function(response){
            //     console.log(response);
            // });
        }
    }
})();
