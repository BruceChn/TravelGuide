//shared service like filter and services
angular.module('app.service',[]);
/*cross app modules*/
angular.module('app.core',[
    /*Angular modules*/
    'ngAnimate',
    /*third party*/
    'ui.router',
    /*shared service*/
    'app.service'
]);
angular.module('app.widget',[]);
angular.module('app.map',[
    'app.core',
    'app.widget'
]);
angular.module('app.attraction',[
    'app.core',
    'app.widget'
]);
angular.module('app.detail',[
    'app.core',
    'app.widget'
]);
angular.module('app.plan',[
    'app.core',
    'app.widget'
]);

angular.module('app',[
        'app.core',
        'app.widget',

        'app.map',
        'app.attraction',
        'app.detail',
        'app.plan'
]);
