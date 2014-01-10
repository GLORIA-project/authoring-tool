function NavbarCtrl($scope, $http, $location, $gloriaLocale) {

	$gloriaLocale.loadResource('lang', 'navbar');

	$scope.navClass = function(menu) {
		var currentRoute = $location.path();

		var cl = '';

		if ($scope.objMenus[menu].href != undefined) {
			cl = $scope.objMenus[menu].href === currentRoute ? 'active' : '';
		} else {
			if ($scope.objMenus[menu].child != undefined) {
				cl += ' dropdown';

				$scope.objMenus[menu].child
						.forEach(function(child) {
							if (child.href != undefined) {
								cl += ' '
										+ (child.href === currentRoute ? 'active'
												: '');
							}
						});
			}
		}

		return cl;
	};

	$scope.linkClass = function(menu) {
		var cl = '';

		if ($scope.objMenus[menu].child != undefined) {
			cl = 'dropdown-toggle';
		}

		return cl;
	};

	$scope.childClass = function(type) {
		if (type == 'header') {
			return 'nav-header';
		} else if (type == 'divider') {
			return 'divider';
		}

		return '';
	};

	$scope.changePath = function(href) {
		$location.path(href);
	};

	$scope.init = function(then) {
		var url = 'conf/navbar.json';
		$scope.menus = [];
		return $http({
			method : "GET",
			url : url,
			cache : false
		}).success(function(data) {
			for ( var key in data) {

				var menu = data[key];
				menu.name = key;

				$scope.menus.push(menu);
			}

			$scope.objMenus = data;

			if (then != undefined) {
				then();
			}
		}).error(function() {
			alert("Navbar resource problem!");
		});
	};

	$scope.init(function() {

	});
}