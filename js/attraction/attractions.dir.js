//attractions.directive.

(function(){
    'use strict';
    angular
        .module('app.attraction')
        .directive("attractions",Attractions);

    // define attractions directive
    Attractions.$inject = ['locationService','$rootScope','$filter','$state','$q','permissionService'];
    function Attractions(locationService,$rootScope,$filter,$state,$q,permissionService){
        return{
          restrict:"E",
          scope:{
              show:"="
          },
          controller:AttractionController,
          controllerAs:'atCtrl',
          bindToController:true,
          templateUrl:"templates/attraction.html",
          link:link
        };
        function link(scope,element){

            scope.model = locationService;
            scope.results = [];
            scope.currentStart = 1;
            scope.previous = previous;
            scope.next = next;
            scope.animate = animate;
            scope.stopAnimate = stopAnimate;
            scope.getDetail = getDetail;
            $rootScope.$on('reset',function(event,data){
                scope.results = [];
                scope.currentStart = 1;

            });
            $rootScope.$on('getDetail',function(event,data){
                getDetail(scope.model.currentIndex,data.index);
            });
            //watch if in the first page
            scope.$watch('model.currentIndex',function(newValue, oldValue, scope){

                if(newValue === 0)
                {
                    element.find('button#pane-section-pagination-button-prev').addClass('pane-section-pagination-button-disabled');
                }
                else {
                    element.find('button#pane-section-pagination-button-prev').removeClass('pane-section-pagination-button-disabled');
                }
            },true);


            // go to the previous page
            function previous(){
                scope.model.currentIndex--;
                scope.model.data = scope.results[scope.model.currentIndex];
                scope.currentStart = scope.currentStart - scope.results[scope.model.currentIndex].length;
                $rootScope.$emit('setMarkers',{data:scope.model.data});
            }
            // go to the next page
            function next(){

                // if in the last page, then go to the new page needs http request
                if(scope.model.currentIndex === (scope.results.length - 1))
                {
                    angular.element('button.searchbtnbox').toggleClass('changed');
                    angular.element('div.section-refresh-overlay').css('visibility','visible');
                    var promise = scope.model.next();
                    promise.then(function(response){

                        scope.currentStart += scope.results[scope.model.currentIndex - 1].length;
                        angular.element('button.searchbtnbox').toggleClass('changed');
                        angular.element('div.section-refresh-overlay').css('visibility','hidden');
                        $rootScope.$emit('setMarkers',{data:scope.model.data});

                    },function(error){
                        console.log(error);
                    });
                }
                else {
                    scope.model.currentIndex++;
                    scope.model.data = scope.results[scope.model.currentIndex];
                    scope.currentStart += scope.results[scope.model.currentIndex - 1].length;
                    $rootScope.$emit('setMarkers',{data:scope.model.data});
                }
            }
            function animate(index){
                $rootScope.$emit('setAnimation',{index:index});
            }
            function stopAnimate(index){
                $rootScope.$emit('stopAnimation',{index:index});
            }
            function getDetail(pageIndex,index){
                angular.element('button.searchbtnbox').toggleClass('changed');
                angular.element('div.section-refresh-overlay').css('visibility','visible');
                var photo_reference = ('photos' in scope.results[pageIndex][index]) ?scope.results[pageIndex][index].photos[0].photo_reference:"unavailable";
                $rootScope.$emit('setMapCenter',{geolocation:scope.results[pageIndex][index].geometry.location});

                var promise1 = scope.model.getDetail(scope.results[pageIndex][index].reference);
                var promise2 = scope.model.getWikipedia(scope.results[pageIndex][index].name);
                $q.all([promise1,promise2]).then(function(){
                    angular.element('div.section-refresh-overlay').css('visibility','hidden');
                    angular.element('button.searchbtnbox').toggleClass('changed');
                    permissionService.isAllowed = true;
                    $state.go('detail',{pageIndex:pageIndex,index:index});
                });

            }

        }
    }

    AttractionController.$inject = ['locationService','$http'];
    function AttractionController(locationService,$http){
        var vm = this;
        vm.model = locationService;
        // function randomString(length, chars) {
        //     var result = '';
        //     for (var i = length; i > 0; --i) {
        //         result += chars[Math.round(Math.random() * (chars.length - 1))];
        //     }
        //     return result;
        // }
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
})();
