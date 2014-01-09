'use strict';

var v = angular.module('gloria.view', []);

function loadDependencies($q, $rootScope, name, gloriaView) {
	var deferred = $q.defer();

	gloriaView.init(function() {
		var view = gloriaView.getViewInfoByName(name);

		if (view != undefined && view.js.length > 0) {
			$script(view.js, function() {
				$rootScope.$apply(function() {
					deferred.resolve();
				});
			});
		} else {
			deferred.resolve();
		}
	});

	return deferred.promise;
}

function ExperimentViewCtrl($scope, $route, $location, gloriaView) {

	var view = gloriaView.getViewInfoByName($route.current.pathParams.name);

	if (view != undefined) {
		$scope.templateUrl = view.html;
	} else {
		$location.path('/wrong');
	}
}

function ViewCtrl($scope, $route, $location, gloriaView) {

	var view = gloriaView.getViewInfoByPath($location.path());

	if (view != undefined) {
		$scope.templateUrl = view.html;
	} else {
		$location.path('/wrong');
	}
}


function MainViewCtrl($scope, $route, $location, gloriaView) {

	var view = gloriaView.getViewInfoByPath($location.path());

	if (view != undefined) {
		$scope.templateUrl = view.html;
	} else {
		$location.path('/wrong');
	}
	
	var views = gloriaView.getViews();
	
	$scope.views = [];
	
	var i = 0;
	for (var key in views) {
		$scope.views.push(views[key]);
		$scope.views[i].name = key;
		i++;
	}	
	
	$scope.gotoView = function (name) {
		$location.path(name);
	};
}

v.service('gloriaView', function($http) {

	var views = null;

	var gView = {

		init : function(then) {
			if (views == null) {
				var url = 'conf/views.json';
				return $http({
					method : "GET",
					url : url,
					cache : false
				}).success(function(data) {
					views = data;
					if (then != undefined) {
						then();
					}
				}).error(function() {
					alert("View resource problem!");
				});
			} else {
				if (then != undefined) {
					then();
				}
			}
		},
		getViewInfoByName : function(name) {
			return views[name];
		},
		getViewInfoByPath : function(path) {
			for ( var key in views) {
				if (views[key].path == path) {
					return views[key];
				}
			}

			return undefined;
		},
		getViews : function () {
			return views;
		}
	};

	return gView;
});

v.config(function($routeProvider, $locationProvider) {
	$routeProvider.when(
			'/templates/experiments/teleoperation/:name',
			{
				template : '<div ng-include src="templateUrl"></div>',
				controller : ExperimentViewCtrl,
				resolve : {
					deps : function($q, $rootScope, gloriaView, $route) {
						return loadDependencies($q, $rootScope,
								$route.current.pathParams.name, gloriaView);
					}
				}
		}).when('/templates/generic', {
			template : '<div ng-include src="templateUrl"></div>',
			controller : ViewCtrl,
			resolve : {
				deps : function($q, $rootScope, gloriaView) {
					return loadDependencies($q, $rootScope, 'generic', gloriaView);
				}
			}
		}).when('/', {
			template : '<div ng-include src="templateUrl"></div>',
			controller : MainViewCtrl,
			resolve : {
				deps : function($q, $rootScope, gloriaView) {
					return loadDependencies($q, $rootScope, 'main', gloriaView);
				}
			}
		}).when('/wrong', {
			template : '<div ng-include src="templateUrl"></div>',
			controller : ViewCtrl,
			resolve : {
				deps : function($q, $rootScope, gloriaView) {
					return loadDependencies($q, $rootScope, 'wrong', gloriaView);
				}
			}
		}).otherwise({
			redirectTo : '/wrong',
		});
});
