//location.fact.js
//this service is used to get the data and store data.

(function(){
    'use strict';

    angular
        .module('app.service')
        .factory('locationService',locationService);
    locationService.$inject = ['$http','$filter','$q','$timeout'];
    function locationService($http,$filter,$q,$timeout){
        var model={
            data:[],// used to store the current search result
            results:[], //used to store all the results
            isZeroData:0,// 0: don't displya result 1: no return result  2: show results;
            currentIndex:0, // the current index of the page
            currentStart:1,
            pagination:{}, // store the next page token used to query next page
            input:"", // the search input
            detail:{}, //store the results of query detail
            wikipedia:{}, // store the results of query wikipedia
            map:{},
            search:search,
            next:next,
            getDetail:getDetail,
            getWikipedia:getWikipedia,
            loadAttraction:loadAttraction

        };


        return model;
        //use stored the names of attractions in created plan to get results;
        function loadAttraction(names){
            model.data.splice(0,model.data.length);
            model.promises = [];
            model.defers = [];
            var service = new google.maps.places.PlacesService(model.map);
            for(var i = 0;i < names.length;i++){
                model.defers.push($q.defer());
                model.promises.push(model.defers[i].promise);
                var request = {
                    query:names[i]
                };

                service.textSearch(request,(function(index){

                    return function(results,status,pagination){
                        if (status == google.maps.places.PlacesServiceStatus.OK) {

                            model.data.push(results[0]);
                            model.pagination = pagination;
                            model.isZeroData = 2;
                            model.defers[index].resolve();
                        }
                        else {
                            model.defers[index].reject("Can't get the result");
                        }
                    };
                })(i));
            }
            return  $q.all(model.promises);
        }
        /// search Input
        function search(input){
            model.currentIndex = 0;
            model.input = input;

            var request ={
                query:'attraction in'+input
            };
            var service = new google.maps.places.PlacesService(model.map);
            model.defer = $q.defer();
            service.textSearch(request,callback);
            return model.defer.promise;

        }
        // get the next list results
        function next(){
            model.defer = $q.defer();
            if(model.pagination.hasNextPage)
            {
                model.currentIndex++;
                model.pagination.nextPage();

            }
            return model.defer.promise;
        }
        // get the details of the selected attraction
        function getDetail(id){
            var service = new google.maps.places.PlacesService(model.map);
            model.defer = $q.defer();
            var request = {
                placeId:id
            };
            service.getDetails(request,callback);

            function callback(place,status){
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    model.detail = place;
                    model.defer.resolve();
                }
                else{
                    model.defer.reject("can't find the place details");
                }
            }
            return model.defer.promise;
        }
        //get the wikipedia result of the selected attraction
        function getWikipedia(title){
            var url = "https://en.wikipedia.org/w/api.php?"+
            "action=query&format=json&prop=&list=search&meta=&utf8=1&srsearch="+ title +
            "&srlimit=1&srprop=sectionsnippet%7Csnippet%7Ctitlesnippet&srinterwiki=1&callback=JSON_CALLBACK";
            return $http.jsonp(url)
                .then(function(response){
                    model.wikipedia = response.data.query.search[0];
                });
        }
        function callback(results,status,pagination){

            if (status == google.maps.places.PlacesServiceStatus.OK) {

                model.data = $filter('orderBy')($filter('nonagent')(results),'-rating');
                model.pagination = pagination;
                model.isZeroData = (results.length === 0)?1:2;
                model.defer.resolve();
            }
            else {
                model.defer.reject("Can't get the result");
            }


        }



    }
})();
