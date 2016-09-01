(function(){
    angular.module('myApp')
    .controller('greeter', greeter);
    function greeter() {

        // ...
        var vm = this;
        vm.getGreeting = function(name) {
          return "Hello " + name;

      };
  }

})();
