/**
 * Created by hao on 15/11/18.
 */
define('main/services', ['main/init'], function () {
    //请求拦截 用于登录超时
    function redirectInterceptor($q, $location) {
        return {
            response: function (response) {
                return response;
            },
            request: function(config) {
                // 成功的请求方法
                console.log(config)
                return config;
            },
            requestError: function(rejection) {
                // 请求发生了错误，如果能从错误中恢复，可以返回一个新的请求或promise
                return response; // 或新的promise
                // 或者，可以通过返回一个rejection来阻止下一步
                // return $q.reject(rejection);
            },
            responseError: function(rejection) {
                // 请求发生了错误，如果能从错误中恢复，可以返回一个新的响应或promise
                return rejection; // 或新的promise
                // 或者，可以通过返回一个rejection来阻止下一步
                // return $q.reject(rejection);
            }
        }
    }
    redirectInterceptor.$inject = ['$q', '$location'];


    function Auth(localStorageService) {
        var _user = localStorageService.get('user');
        var setUser = function(user) {
            _user = user;
        };
        return {
/*            isAuthorized: function(lvl) {
                return _user.level >= lvl;
            },*/
            setUser: setUser,
            isLoggedIn: function() {
                return _user ? true : false;
            },
            getUser: function() {
                return _user;
            },
/*            getId: function() {
                return _user ? _user._id : null;
            },*/
            getToken: function() {
                return _user ? _user.token : '';
            },
            logout: function() {
                localStorageService.remove('user');
                _user = null; }
        }
    };
    redirectInterceptor.$inject = ['localStorageService'];

//数据请求
    function requestData($q, $http, $httpParamSerializer) {
        return function (_url, _params) {
            var defer = $q.defer();
            $http({
                method: 'POST',
                url: _url,
                data: _params || {},
                transformRequest: function (data) {
                    return $httpParamSerializer(data);
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
                .success(function (_data, status, headers, config) {
                    if (status == 200 && _data.code == 200) {
                        defer.resolve([_data.data, _data]);
                    } else {
                        defer.reject(_data.message || '出错了');
                    }
                })
                .error(function () {
                    defer.reject("提交失败!");
                });

            return defer.promise;
        }
    };
    requestData.$inject = ['$q', '$http', '$httpParamSerializer'];

    //弹窗确认
    function dialogConfirm($rootScope, modal) {
        return function (_text, _callBack) {
            var _$scope = $rootScope.$new(false);
            _$scope.confirmText = _text || '确定删除?';
            modal.openConfirm({
                template: 'tpl/dialog-confirm.html',
                scope: _$scope
            }).then(_callBack);
        };
    };
    dialogConfirm.$inject = ['$rootScope', 'modal'];

    //弹窗提示
    function dialogAlert($rootScope, modal) {
        return function (_text, _callBack) {
            var _$scope = $rootScope.$new(false);
            _$scope.confirmText = _text || '确定';
            modal.openConfirm({
                template: 'tpl/dialog-alert.html',
                scope: _$scope
            }).then(_callBack);
        };
    };
    dialogAlert.$inject = ['$rootScope', 'modal'];

    //普通弹窗
    function dialog($rootScope, modal) {
        return function (_content, _callBack) {
            var _$scope = $rootScope.$new(false);
            _$scope.content = _content;
            modal.openConfirm({
                template: 'tpl/dialog-center.html',
                scope: _$scope
            }).then(_callBack);
        };
    };
    dialog.$inject = ['$rootScope', 'modal'];

    //图表弹窗
    function dialogChart($rootScope, modal, $http) {
        return function (_url) {
            var _$scope = $rootScope.$new(false);
            var _params = {};
            var _urlObj = _url.split("?");
            if (_urlObj[1]) {
                angular.forEach(_urlObj[1].split("&"), function (_row) {
                    var _arr = _row.split("=");
                    _params[_arr[0]] = _arr[1];
                })
            }
            _$scope.url = _url;
            _$scope.urlParams = _params;
            modal.open({
                template: 'tpl/dialog-center.html',
                scope: _$scope
            });
        };
    };
    dialogChart.$inject = ['$rootScope', 'modal', '$http'];

    angular.module('manageApp.main')
        .factory('redirectInterceptor', redirectInterceptor)
        .service('Auth', Auth)
        .service('requestData', requestData)
        .service('dialogConfirm', dialogConfirm)
        .service('dialogAlert', dialogAlert)
        .service('dialog', dialog)
        .service('dialogChart', dialogChart)
        .config(['$httpProvider', function ($httpProvider) {
            $httpProvider.interceptors.push('redirectInterceptor');
        }])
});