describe('storage facotry',function(){
    var storageService,$window,storagekey;
    beforeEach(module('app.service'));
    beforeEach(function(){
        $window = {
            localStorage:{
                getItem:function(key){
                    return this[key];
                },
                removeItem:function(key){
                    delete this[key];
                },
                setItem:function(key,value)
                {
                    this[key] = value;
                }
            },
            addEventListener:function(name,persistData){
            }
        };
        function persistData(){
        }
        module(function($provide) {
         $provide.value('$window', $window);
        });

     });


    describe('test loadData',function(){

        describe('test return of loadData',function(){
            beforeEach(function(){
                $window.localStorage.setItem('angularjs_travel_plan', [{'San Jose':['1','2']}]);
            });
            beforeEach(inject(function(_storageService_,_storageKey_){
                storageService = _storageService_;
                storageKey = _storageKey_;
            }));
            it('storageService should be existed',function(){
                expect(storageService).toBeDefined();


            });
            it('storageKey should be equal the specific key',function(){
                expect(storageKey).toEqual('angularjs_travel_plan');
            });

            it('should return the attraction array',function(){

                expect($window.localStorage).toBeDefined();
                expect(storageService.items).toEqual({'0':{'San Jose':['1','2']}});
            });
        });
        describe('test return of loadData without created localStorage',function(){
            beforeEach(inject(function(_storageService_,_storageKey_){
                storageService = _storageService_;
                storageKey = _storageKey_;
            }));
            it('the created plan should return empty array',function(){
                expect(storageService.items).toEqual({});
            });
        });
        describe('clear plans',function(){

            beforeEach(inject(function(_storageService_,_storageKey_){
                storageService = _storageService_;
                storageKey = _storageKey_;
            }));
            beforeEach(function(){
                storageService.items = {'0':{'San Jose':['1','2']},'1':{'Los Angeles':['3','4']}};
                storageService.clear();

            });
            it('clear all the created plans',function(){
                expect(storageService.items).toEqual({});
            });
        });

    });
});
