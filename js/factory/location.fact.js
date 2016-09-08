//location.fact.js

(function(){
    'use strict';

    angular
        .module('myApp')
        .factory('location',location);
    location.$inject = ['$http'];
    function location($http){
        var model={
            data:[],
            isZeroData:0,// 0: don't displya result 1: no return result  2: show results;
            currentIndex:0,
            search:search,
            next:next,
            nextPageToken:"",
            input:""
        };
        function search(input){
            model.currentIndex = 0;
            model.input = input;
            var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=attraction+in+" +
                model.input + "&key=AIzaSyB0e53B86tTI03YQGvN6gNA5s-MwTThHHY";
            return $http.get(url)
                .then(function(response){
                    model.data = response.data.results;

                    if('next_page_token' in response.data){
                        model.nextPageToken = response.data.next_page_token;
                    }
                    else {
                        model.nextPageToken = "";
                    }
                    model.isZeroData = (response.data.results.length === 0)?1:2;
                });
        }
        function next(){
            if(model.nextPageToken !== "")
            {
                var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=attraction+in+" +
                    model.input + "&key=AIzaSyB0e53B86tTI03YQGvN6gNA5s-MwTThHHY" +  "&pagetoken=" + model.nextPageToken;

                model.currentIndex++;
                return $http.get(url)
                        .then(function(response){
                            model.data = response.data.results;
                            if('next_page_token' in response.data)
                            {
                                model.nextPageToken = response.data.next_page_token;
                            }
                            else {
                                model.nextPageToken = "";
                            }
                            model.isZeroData = (response.data.results.length === 0)?1:2;
                        });

            }

        }
        return model;
    }
})();
