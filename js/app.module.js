// angular.module('myApp',[
//         'ngAnimate',
//         'ui.router']);
angular.module('app.service',[]);
angular.module('app.core',[
    'ngAnimate',
    'ui.router',
    'app.service'
]);
angular.module('app.map',[
    'app.core'
]);
angular.module('app.attraction',[
    'app.core'
]);
angular.module('app.detail',[
    'app.core'
]);


angular.module('app',[
        'app.core',

        'app.map',
        'app.attraction',
        'app.detail'
]);
