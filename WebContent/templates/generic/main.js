'use strict';

function GenericCtrl($gloriaAPI, $scope, $timeout,
		$gloriaLocale, $routeParams) {

	$gloriaLocale.loadResource('templates/generic', 'generic');
	$scope.specificHtml = 'templates/generic/content.html';

	$scope.onUnauth = function() {
		$scope.$emit('unauthorized');
	};

	$scope.onDown = function() {
		$scope.$emit('server down');
	};

	$scope.$watch('notAuthorized', function() {
		if ($scope.notAuthorized) {
			$scope.unauthTimer = $timeout($scope.onUnauth, 1500);
		}
	});

	$scope.$watch('serverDown', function() {
		if ($scope.serverDown) {
			$scope.srvTimer = $timeout($scope.onDown, 1500);
		}
	});

	$scope.$on('$destroy', function() {
		$timeout.cancel($scope.unauthTimer);
		$timeout.cancel($scope.srvTimer);		
	});
	
	$gloriaAPI.getUserInformation(function(data) {
		console.log(data);
	});
}