'use strict';

/*
 * Locale module
 */

var locale = angular.module('gloria.locale', []);

locale.controller('LocaleController', function($scope, $sce, $gloriaLocale,
		$window, $gloriaView) {

	$scope.languages = $gloriaLocale.getLanguages();
	$scope.language = $gloriaLocale.getPreferredLanguage();

	$scope.setLanguage = function(index) {
		$gloriaLocale.setPreferredLanguage($scope.languages[index]);
		$window.location.reload();
	};
});

locale.service('$gloriaLocale', function($locale, $http, $window, $myCookie,
		$cookieStore) {

	var languages = [ 'en', 'es', 'it', 'pl', 'cz', 'ru' ];

	$locale.dictionary = {};
	var langCookie = $myCookie('preferredLang');

	var reg = new RegExp('"', 'g');

	if (langCookie != null && langCookie != undefined) {
		langCookie = langCookie.replace(reg, '');
	}

	locale.preferredLang = langCookie;

	if (locale.preferredLang == undefined) {
		locale.preferredLang = $window.navigator.userLanguage
				|| $window.navigator.language || 'en';

		var languageParts = locale.preferredLang.split("-");
		locale.preferredLang = languageParts[0];
	}

	$locale.id = locale.preferredLang;

	var gLocale = {

		getLanguages : function() {
			return languages;
		},
		getDictionary : function() {
			return $locale.dictionary;
		},
		getLocale : function() {
			return $locale;
		},
		getLanguage : function() {
			return $locale.id;
		},
		loadResource : function(path, name, then) {
			var url = path + '/lang_' + name + '_' + $locale.id + '.json';
			$http({
				method : "GET",
				url : url,
				cache : false,
				headers : {
					Accept : 'application/vnd.github.3.raw'
				}
			}).success(function(data) {
				$locale.dictionary[name] = data;
				if (then != undefined) {
					then();
				}
			}).error(function() {
				var url = path + '/lang_' + name + '_en.json';
				$http({
					method : "GET",
					url : url,
					cache : false,
					headers : {
						Accept : 'application/vnd.github.3.raw'
					}
				}).success(function(data) {
					$locale.dictionary[name] = data;
					if (then != undefined) {
						then();
					}
				}).error(function() {
					alert("Locale resource problem: " + name);
				});

			});
		},
		loadCore : function(path, lang, post) {
			var url = path + '/lang_core_' + lang + '.json';
			$http({
				method : "GET",
				url : url,
				cache : false,
				headers : {
					Accept : 'application/vnd.github.3.raw'
				}
			}).success(function(data) {
				$locale.DATETIME_FORMATS = data.DATETIME_FORMATS;
				$locale.NUMBER_FORMATS = data.NUMBER_FORMATS;
				$locale.id = data.id;
				if (post != undefined) {
					post();
				}
			}).error(function() {
				var url = path + '/lang_core_en.json';
				$http({
					method : "GET",
					url : url,
					cache : false,
					headers : {
						Accept : 'application/vnd.github.3.raw'
					}
				}).success(function(data) {
					$locale.DATETIME_FORMATS = data.DATETIME_FORMATS;
					$locale.NUMBER_FORMATS = data.NUMBER_FORMATS;
					$locale.id = data.id;
					if (post != undefined) {
						post();
					}
				}).error(function() {
					alert("Locale core problem!");
				});

			});
		},
		getPreferredLanguage : function() {
			return locale.preferredLang;
		},
		setPreferredLanguage : function(lang) {
			locale.preferredLang = lang;
			$cookieStore.put('preferredLang', lang);
			$myCookie('preferredLang', {
				value : '%22' + lang + '%22',
				path : '/',
				expires : 1
			});
		}
	};

	return gLocale;
});

locale.run(function($gloriaEnv, $gloriaLocale, $rootScope) {
	$rootScope.headerReady = false;

	$gloriaEnv.after(function() {
		$gloriaLocale.loadCore($gloriaEnv.getLangPath(), locale.preferredLang,
				function() {
					$gloriaLocale.loadResource($gloriaEnv.getLangPath(),
							'base', function() {
								$rootScope.headerReady = true;
							});
				});
	});
});

locale.filter('i18n', function($gloriaLocale) {
	return function(key, p1, p2, p3) {

		var dictionary = $gloriaLocale.getDictionary();

		var keyParts = key.split('.');
		var value = undefined;
		keyParts.forEach(function(key) {
			if (value == undefined) {
				value = dictionary[key];
			} else {
				value = value[key];
			}
		});

		if (typeof value != 'undefined' && value != '') {

			var result = (typeof p1 === "undefined") ? value : value.replace(
					'@{p1}@', p1);

			result = (typeof p2 === "undefined") ? result : result.replace(
					'@{p2}@', p2);

			result = (typeof p3 === "undefined") ? result : result.replace(
					'@{p3}@', p3);

			return result;
		}

		// return '?';
	};
});

/*
 * Views module
 */

var v = angular.module('gloria.view', []);

function loadDependencies($q, $rootScope, $location, $gloriaView) {
	var deferred = $q.defer();

	$gloriaView.init(function() {
		var view = $gloriaView.getViewInfoByPath($location.path());

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

function BasicViewCtrl($scope, $route, $location, $gloriaView) {

	var view = $gloriaView.getViewInfoByPath($location.path());

	if (view != undefined) {
		$scope.templateUrl = view.html;
	} else {
		$location.path($gloriaView.getWrongPathView().path);
	}
}

function MainViewCtrl($scope, $route, $location, $gloriaView) {

	var view = $gloriaView.getViewInfoByPath($location.path());

	if (view != undefined) {
		$scope.templateUrl = view.html;
	} else {
		$location.path($gloriaView.getWrongPathView().path);
	}

	var views = $gloriaView.getViews();

	$scope.views = [];

	var i = 0;
	for ( var key in views) {
		$scope.views.push(views[key]);
		$scope.views[i].name = key;
		i++;
	}

	$scope.gotoView = function(name) {
		$location.path(name);
	};
}

v.service('$gloriaView', function($http) {

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
		getWrongPathView : function(path) {
			for ( var key in views) {
				if (views[key].type == 'wrong-path') {
					return views[key];
				}
			}

			return undefined;
		},
		getMainView : function(path) {
			for ( var key in views) {
				if (views[key].type == 'main') {
					return views[key];
				}
			}

			return undefined;
		},
		getWelcomeView : function(path) {
			for ( var key in views) {
				if (views[key].type == 'welcome') {
					return views[key];
				}
			}

			return undefined;
		},
		getViews : function() {
			return views;
		}
	};

	return gView;
});

v.config(function($routeProvider) {
	v.lazy = {
		route : $routeProvider
	};
});

v.run(function($rootScope, $route, $gloriaView) {
	$gloriaView.init(function() {
		var views = $gloriaView.getViews();

		for ( var key in views) {

			var type = views[key].type;
			var reqController = BasicViewCtrl;

			if (type == 'main') {
				reqController = MainViewCtrl;
			}

			v.lazy.route.when(views[key].path, {
				template : '<div ng-include src="templateUrl"></div>',
				controller : reqController,
				resolve : {
					deps : function($q, $rootScope, $location, $gloriaView) {
						return loadDependencies($q, $rootScope, $location,
								$gloriaView);
					}
				}
			});
		}

		v.lazy.route.otherwise({
			redirectTo : $gloriaView.getWrongPathView().path,
		});

		$route.reload();
	});
});

/*
 * Toolbox module (main)
 */

var toolbox = angular.module('toolbox', [ 'ngCookies', 'ngRoute', 'ngAnimate', 'ngSanitize',
		'gloria.locale', 'gloria.view', 'gloria.api', 'ui.bootstrap' ]);

toolbox.filter('utc', [ function() {
	return function(date) {
		if (angular.isNumber(date)) {
			date = new Date(date);
		}
		return new Date(date.getUTCFullYear(), date.getUTCMonth(), date
				.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date
				.getUTCSeconds());
	};
} ]);

toolbox.filter('highlight', [ function() {
	return function(input, query) {
		return input.replace(RegExp('(' + query + ')', 'g'),
				'<strong>$1</strong>');
	};
} ]);

toolbox.directive('jtooltip', function() {
	return {
		// Restrict it to be an attribute in this case
		restrict : 'A',
		// responsible for registering DOM listeners as well as updating the DOM
		link : function(scope, element, attrs) {
			$(element).popover(scope.$eval(attrs.jtooltip));
			$(element).popover('show');
		}
	};
});

toolbox.directive('errSrc', function() {
	return {
		link : function(scope, element, attrs) {
			element.bind('error', function() {
				element.attr('src', attrs.errSrc);
			});
		}
	};
});

toolbox.service('$gloriaEnv', function($http) {

	var options = null;
	var initDone = false;

	var afterSuccess = [];

	var gEnv = {

		init : function() {
			var url = 'conf/env.json';
			return $http({
				method : "GET",
				url : url,
				cache : false
			}).success(function(data) {
				options = data;

				initDone = true;

				afterSuccess.forEach(function(then) {
					if (then != undefined) {
						then();
					}
				});
			}).error(function() {
				alert("Options resource problem!");
				requested = false;
			});
		},
		getOption : function(name) {
			return options[name];
		},
		getJsPath : function() {
			return options['basePath'].js;
		},
		getImgPath : function() {
			return options['basePath'].img;
		},
		getLangPath : function() {
			return options['basePath'].lang;
		},
		getHtmlPath : function() {
			return options['basePath'].html;
		},
		getCssPath : function() {
			return options['basePath'].css;
		},
		after : function(then) {
			if (!initDone) {
				afterSuccess.push(then);
			} else {
				then();
			}
		}
	};

	return gEnv;
});

toolbox.config(function($sceDelegateProvider, $filterProvider) {

	$sceDelegateProvider
			.resourceUrlWhitelist([ 'self', 'https://rawgithub.com/fserena/**',
					'http://fserena.github.io/**' ]);

	// save references to the providers
	toolbox.lazy = {
		filter : $filterProvider.register,
	};
});

toolbox.run(function($gloriaLocale, $gloriaEnv, $rootScope) {

	$rootScope.titleLoaded = false;

	$gloriaLocale.loadResource('lang', 'title', function() {

		$gloriaEnv.after(function() {
			if ($gloriaEnv.getOption('hubref') != undefined) {
				$rootScope.hubref = $gloriaEnv.getOption('hubref');
			}

			if ($gloriaEnv.getOption('wref') != undefined) {
				$rootScope.wref = $gloriaEnv.getOption('wref');
			}

			var basePath = $gloriaEnv.getOption('basePath');

			if (basePath != undefined) {

				$rootScope.jsPath = basePath.js;
				$rootScope.cssPath = basePath.css;
				$rootScope.imgPath = basePath.img;
				$rootScope.langPath = basePath.lang;

				$rootScope.htmlPath = basePath.html;
				$rootScope.headerHtml = $rootScope.htmlPath + '/header.html';
				$rootScope.footerHtml = $rootScope.htmlPath + '/footer.html';
				$rootScope.bodyHtml = $rootScope.htmlPath + '/body.html';
			}

			if ($gloriaEnv.getOption('navbar')) {
				$rootScope.navbarHtml = $rootScope.htmlPath + '/navbar.html';
			}

			$rootScope.titleLoaded = true;
			$rootScope.toolboxReady = true;
		});

		$gloriaEnv.init();
	});
});

toolbox.controller('MainController', function($scope, $http, $window,
		$location, $gloriaLocale, $gloriaEnv, $gloriaView) {

	$scope.ready = false;
	$scope.wrapperStyle = {
		height : '650px'
	};

	$scope.gotoHub = function() {
		if ($scope.hubref != undefined) {

			if ($scope.hubref.app != undefined) {

				var url = $window.location.origin;
				if (url == undefined) {
					url = $window.location.protocol + "//"
							+ $window.location.host;
				}
				if ($scope.hubref.app.length > 0) {
					url += '/';
				}
				url += $scope.hubref.app + '/#';
				if ($scope.hubref.path != undefined) {
					url += $scope.hubref.path;
				}
				$window.location.href = url;
			} else if ($scope.hubref.url != undefined) {
				$window.location.href = $scope.hubref.url;
			} else if ($scope.hubref.path != undefined) {
				$location.path($scope.hubref.path);
			}
		}
	};

	$scope.gotoMain = function() {
		$location.path($gloriaView.getMainView().path);
	};

	$scope.gotoWelcome = function() {

		if ($scope.wref != undefined) {
			if ($scope.wref.app != undefined) {

				var url = $window.location.origin;
				if (url == undefined) {
					url = $window.location.protocol + "//"
							+ $window.location.host;
				}
				if ($scope.wref.app.length > 0) {
					url += '/';
				}
				url += $scope.wref.app + '/#';
				if ($scope.wref.path != undefined) {
					url += $scope.wref.path;
				}
				$window.location.href = url;
			} else if ($scope.wref.url != undefined) {
				$window.location.href = $scope.wref.url;
			} else if ($scope.wref.path != undefined) {
				$location.path($scope.wref.path);
			}
		} else {
			var welcome = $gloriaView.getWelcomeView();
			if (welcome != undefined) {
				$location.path(welcome.path);
			} else {
				var wrong = $gloriaView.getWrongPathView();

				if (wrong != undefined) {
					$location.path(wrong.path);
				} else {
					alert('no welcome view');
				}
			}
		}
	};
});

toolbox.controller('LoginController', function($scope, $location, Login,
		$gloriaView, $timeout) {

	$scope.loaded = false;
	$scope.login = {};
	$scope.login.user = null;
	$scope.verified = false;
	$scope.login.failed = false;

	$scope.option = 'register';
	$scope.accountOption = "base.login.forgot";

	$scope.toggleLoginFace = function() {
		if ($scope.option == 'register') {
			$scope.accountOption = "base.login.new";
			$scope.option = 'reset';
		} else {
			$scope.accountOption = "base.login.forgot";
			$scope.option = 'register';
		}
	};

	$scope.inputStyle = {};

	$scope.canBeShown = function() {
		var view = $gloriaView.getViewInfoByPath($location.path());
		var go = false;

		if (view != undefined) {
			if ($scope.login.user != null) {
				go = view.visibility != 'only-public';
				if (!go) {
					$scope.gotoWelcome();
				}

				return go;
			}

			go = view.visibility == "public"
					|| view.visibility == "only-public";

			return go;
		}

		$scope.gotoWelcome();
	};

	$scope.login.connect = function() {

		var tmpEmail = $("#email").val();
		if (tmpEmail != undefined) {
			$scope.login.email = tmpEmail;
		}

		var tmpPassword = $("#password").val();
		if (tmpPassword != undefined) {
			$scope.login.password = tmpPassword;
		}

		if ($scope.login.email != null && $scope.login.password != null) {
			Login.authenticate($scope.login.email, $scope.login.password).then(
					function() {
						$scope.login.user = $scope.login.email;
						$scope.gotoMain();
					}, function(data) {
						$scope.login.user = null;
						$scope.login.failed = true;
						$scope.inputStyle.borderColor = 'rgb(255, 82, 0)';
					});
		}
	};

	$scope.$watch('login.email', function() {
		if ($scope.login.failed) {
			$scope.login.failed = false;
			$scope.inputStyle.borderColor = undefined;
		}
	});

	$scope.$watch('login.password', function() {
		if ($scope.login.failed) {
			$scope.login.failed = false;
			$scope.inputStyle.borderColor = undefined;
		}
	});

	$scope.login.disconnect = function() {
		Login.disconnect();
		$scope.login.user = null;
		$scope.login.email = null;
		$scope.login.password = null;
		document.execCommand("ClearAuthenticationCache");
		$scope.gotoWelcome();
	};

	$scope.$on('unauthorized', function() {
		console.log("unauthorized event received!");
		$scope.login.disconnect();
	});

	$scope.$on('server down', function() {
		console.log("server down event received!");
		$scope.login.disconnect();
	});

	$scope.$on('$destroy', function() {
		$timeout.cancel($scope.login.timer);
	});

	Login.verifyToken(function() {
		$scope.login.user = Login.getUser();
		$scope.verified = true;
		// $scope.gotoMain();
	}, function() {
		$scope.verified = true;
		$scope.gotoWelcome();
	});
});

toolbox.service('$gloriaNav', function($http) {

	var menus = [];
	var objMenus = [];
	var initDone = false;

	var afterSuccess = [];

	var gNav = {

		init : function() {
			var url = 'conf/navbar.json';
			return $http({
				method : "GET",
				url : url,
				cache : false
			}).success(function(data) {
				for ( var key in data) {

					var menu = data[key];
					menu.name = key;

					menus.push(menu);
				}

				objMenus = data;

				initDone = true;

				afterSuccess.forEach(function(then) {
					if (then != undefined) {
						then();
					}
				});

			}).error(function() {
				alert("Navbar resource problem!");
			});
		},
		getMenu : function(name) {
			return objMenus[name];
		},
		getMenusArray : function() {
			return menus;
		},
		after : function(then) {
			if (!initDone) {
				afterSuccess.push(then);
			} else {
				then();
			}
		}
	};

	return gNav;
});

toolbox.run(function($gloriaLocale, $gloriaNav, $rootScope) {

	$rootScope.navReady = false;

	$gloriaLocale.loadResource('lang', 'navbar', function() {
		$gloriaNav.after(function() {
			$rootScope.navReady = true;
		});
		$gloriaNav.init();
	});
});

toolbox.controller('NavbarCtrl', function($scope, $http, $location, $window,
		$gloriaLocale, $gloriaNav) {

	$scope.navClass = function(menu) {
		var currentRoute = $location.path();

		var cl = '';

		if ($gloriaNav.getMenu(menu).href != undefined) {
			cl = $gloriaNav.getMenu(menu).href.path === currentRoute ? 'active'
					: '';
		} else {
			if ($gloriaNav.getMenu(menu).child != undefined) {
				cl += ' dropdown';

				$gloriaNav.getMenu(menu).child.forEach(function(child) {
					if (child.href != undefined) {
						cl += ' '
								+ (child.href.path === currentRoute ? 'active'
										: '');
					}
				});
			}
		}

		return cl;
	};

	$scope.linkClass = function(menu) {
		var cl = '';

		if ($gloriaNav.getMenu(menu).child != undefined) {
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
		if (href != undefined) {

			if (href.app != undefined) {
				var url = $window.location.origin;
				if (url == undefined) {
					url = $window.location.protocol + "//"
							+ $window.location.host;
				}
				if (href.app.length > 0) {
					url += '/';
				}
				url += href.app + '/#';
				if (href.path != undefined) {
					url += href.path;
				}
				$window.location.href = url;
			} else if (href.url != undefined) {
				$window.location.href = href.url;
			} else if (href.path != undefined) {
				$location.path(href.path);
			}
		}
	};

	$gloriaNav.after(function() {
		$scope.menus = $gloriaNav.getMenusArray();
	});
});

toolbox.animation('.reveal-animation', function() {
	return {
		enter : function(element, done) {
			element.css('display', 'none');
			element.fadeIn(100, done);
			return function() {
				element.stop();
			};
		},
		leave : function(element, done) {
			element.fadeOut(100, done);
			return function() {
				element.stop();
			};
		}
	};
});
