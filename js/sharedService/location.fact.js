//location.fact.js

(function(){
    'use strict';

    angular
        .module('app.service')
        .factory('locationService',locationService);
    locationService.$inject = ['$http','$filter'];
    function locationService($http,$filter){
        var model={
            data:[], // used to store the current search result
            isZeroData:0,// 0: don't displya result 1: no return result  2: show results;
            currentIndex:0, // the current index of the page
            nextPageToken:"", // store the next page token used to query next page
            input:"", // the search input
            detail:{}, //store the results of query detail
            wikipedia:{}, // store the results of query wikipedia
            search:search,
            next:next,
            getDetail:getDetail,
            getWikipedia:getWikipedia
        };


        return model;
        // search Input
        function search(input){
            model.currentIndex = 0;
            model.input = input;
            var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=attraction+in+" +
                model.input + "&key=AIzaSyB0e53B86tTI03YQGvN6gNA5s-MwTThHHY";
            return $http.get(url)
                .then(function(response){
                    model.data = $filter('orderBy')($filter('nonagent')(response.data.results),'-rating');

                    if('next_page_token' in response.data){
                        model.nextPageToken = response.data.next_page_token;
                    }
                    else {
                        model.nextPageToken = "";
                    }
                    model.isZeroData = (response.data.results.length === 0)?1:2;
                });
        }
        // get the next list results
        function next(){
            if(model.nextPageToken !== "")
            {

                var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=attraction+in+" +
                    model.input + "&key=AIzaSyB0e53B86tTI03YQGvN6gNA5s-MwTThHHY" +  "&pagetoken=" + model.nextPageToken;

                model.currentIndex++;
                return $http.get(url)
                        .then(function(response){
                            model.data = $filter('orderBy')($filter('nonagent')(response.data.results),'-rating');

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
        // get the details of the selected attraction
        function getDetail(reference){
            var url = "https://maps.googleapis.com/maps/api/place/details/json?reference="+
            reference + "&key=AIzaSyB0e53B86tTI03YQGvN6gNA5s-MwTThHHY";
            return $http.get(url)
                .then(function(response){
                    model.detail = response.data.result;

                });
        }
        //get the wikipedia result of the selected attraction
        function getWikipedia(title){
            var url = "https://en.wikipedia.org/w/api.php?"+
            "action=query&format=json&prop=&list=search&meta=&utf8=1&srsearch="+ title +
            "&srlimit=1&srprop=sectionsnippet%7Csnippet%7Ctitlesnippet&srinterwiki=1";
            return $http.get(url)
                .then(function(response){
                    model.wikipedia = response.data.query.search[0];
                });
        }

    }
})();
