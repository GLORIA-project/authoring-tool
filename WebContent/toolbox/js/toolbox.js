'use strict';

// http://kevin.vanzonneveld.net
// + original by: Webtoolkit.info (http://www.webtoolkit.info/)
// + namespaced by: Michael White (http://getsprink.com)
// + tweaked by: Jack
// + improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
// + input by: Brett Zamir (http://brett-zamir.me)
// + bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
// - depends on: utf8_encode
// * example 1: md5('Kevin van Zonneveld');
// * returns 1: '6e658d4bfcb59cc13f96c14450ac40b9'
// Adapted to AngularJS Service by: Jim Lavin (http://jimlavin.net)
// after injecting into your controller, directive or service
// * example 1: md5.createHash('Kevin van Zonneveld');
// * returns 1: '6e658d4bfcb59cc13f96c14450ac40b9'

angular
		.module('md5', [])
		.factory(
				'md5',
				[ function() {

					var md5 = {

						createHash : function(str) {

							var xl;

							var rotateLeft = function(lValue, iShiftBits) {
								return (lValue << iShiftBits)
										| (lValue >>> (32 - iShiftBits));
							};

							var addUnsigned = function(lX, lY) {
								var lX4, lY4, lX8, lY8, lResult;
								lX8 = (lX & 0x80000000);
								lY8 = (lY & 0x80000000);
								lX4 = (lX & 0x40000000);
								lY4 = (lY & 0x40000000);
								lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
								if (lX4 & lY4) {
									return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
								}
								if (lX4 | lY4) {
									if (lResult & 0x40000000) {
										return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
									} else {
										return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
									}
								} else {
									return (lResult ^ lX8 ^ lY8);
								}
							};

							var _F = function(x, y, z) {
								return (x & y) | ((~x) & z);
							};
							var _G = function(x, y, z) {
								return (x & z) | (y & (~z));
							};
							var _H = function(x, y, z) {
								return (x ^ y ^ z);
							};
							var _I = function(x, y, z) {
								return (y ^ (x | (~z)));
							};

							var _FF = function(a, b, c, d, x, s, ac) {
								a = addUnsigned(a, addUnsigned(addUnsigned(_F(
										b, c, d), x), ac));
								return addUnsigned(rotateLeft(a, s), b);
							};

							var _GG = function(a, b, c, d, x, s, ac) {
								a = addUnsigned(a, addUnsigned(addUnsigned(_G(
										b, c, d), x), ac));
								return addUnsigned(rotateLeft(a, s), b);
							};

							var _HH = function(a, b, c, d, x, s, ac) {
								a = addUnsigned(a, addUnsigned(addUnsigned(_H(
										b, c, d), x), ac));
								return addUnsigned(rotateLeft(a, s), b);
							};

							var _II = function(a, b, c, d, x, s, ac) {
								a = addUnsigned(a, addUnsigned(addUnsigned(_I(
										b, c, d), x), ac));
								return addUnsigned(rotateLeft(a, s), b);
							};

							var convertToWordArray = function(str) {
								var lWordCount;
								var lMessageLength = str.length;
								var lNumberOfWords_temp1 = lMessageLength + 8;
								var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
								var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
								var lWordArray = new Array(lNumberOfWords - 1);
								var lBytePosition = 0;
								var lByteCount = 0;
								while (lByteCount < lMessageLength) {
									lWordCount = (lByteCount - (lByteCount % 4)) / 4;
									lBytePosition = (lByteCount % 4) * 8;
									lWordArray[lWordCount] = (lWordArray[lWordCount] | (str
											.charCodeAt(lByteCount) << lBytePosition));
									lByteCount++;
								}
								lWordCount = (lByteCount - (lByteCount % 4)) / 4;
								lBytePosition = (lByteCount % 4) * 8;
								lWordArray[lWordCount] = lWordArray[lWordCount]
										| (0x80 << lBytePosition);
								lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
								lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
								return lWordArray;
							};

							var wordToHex = function(lValue) {
								var wordToHexValue = "", wordToHexValue_temp = "", lByte, lCount;
								for (lCount = 0; lCount <= 3; lCount++) {
									lByte = (lValue >>> (lCount * 8)) & 255;
									wordToHexValue_temp = "0"
											+ lByte.toString(16);
									wordToHexValue = wordToHexValue
											+ wordToHexValue_temp
													.substr(
															wordToHexValue_temp.length - 2,
															2);
								}
								return wordToHexValue;
							};

							var x = [], k, AA, BB, CC, DD, a, b, c, d, S11 = 7, S12 = 12, S13 = 17, S14 = 22, S21 = 5, S22 = 9, S23 = 14, S24 = 20, S31 = 4, S32 = 11, S33 = 16, S34 = 23, S41 = 6, S42 = 10, S43 = 15, S44 = 21;

							// str = this.utf8_encode(str);
							x = convertToWordArray(str);
							a = 0x67452301;
							b = 0xEFCDAB89;
							c = 0x98BADCFE;
							d = 0x10325476;

							xl = x.length;
							for (k = 0; k < xl; k += 16) {
								AA = a;
								BB = b;
								CC = c;
								DD = d;
								a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
								d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
								c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
								b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
								a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
								d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
								c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
								b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
								a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
								d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
								c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
								b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
								a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
								d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
								c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
								b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
								a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
								d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
								c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
								b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
								a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
								d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
								c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
								b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
								a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
								d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
								c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
								b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
								a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
								d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
								c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
								b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
								a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
								d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
								c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
								b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
								a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
								d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
								c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
								b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
								a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
								d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
								c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
								b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
								a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
								d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
								c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
								b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
								a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244);
								d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
								c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
								b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
								a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
								d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
								c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
								b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
								a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
								d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
								c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314);
								b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
								a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
								d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
								c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
								b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
								a = addUnsigned(a, AA);
								b = addUnsigned(b, BB);
								c = addUnsigned(c, CC);
								d = addUnsigned(d, DD);
							}

							var temp = wordToHex(a) + wordToHex(b)
									+ wordToHex(c) + wordToHex(d);

							return temp.toLowerCase();
						}

					};

					return md5;

				} ]);

/*
 * An Simple AngularJS Gravatar Directive
 * 
 * Written by Jim Lavin http://codingsmackdown.tv
 * 
 */
angular
		.module('ui-gravatar', [ 'md5' ])
		.directive(
				'gravatarImage',
				function(md5) {
					return {
						restrict : "EAC",
						link : function(scope, elm, attrs) {
							// by default the values will come in as undefined
							// so we need to
							// setup a watch to notify us when the value changes
							scope
									.$watch(
											attrs.email,
											function(value) {
												// let's do nothing if the value
												// comes in empty, null or
												// undefined
												if ((value !== null)
														&& (value !== undefined)
														&& (value !== '')) {
													// convert the value to
													// lower case and then to a
													// md5 hash
													var hash = md5
															.createHash(value
																	.toLowerCase());
													var size = attrs.size;
													// default to 40 pixels if
													// not set
													if ((size === null)
															|| (size == undefined)
															|| (size == '')) {
														size = 40;
													}

													// construct the tag to
													// insert into the element
													var tag = '<img alt="" src="http://www.gravatar.com/avatar/'
															+ hash
															+ '?s='
															+ size
															+ '&r=pg&d=retro" />';
													// insert the tag into the
													// element

													var href = attrs.href;
													if ((href != null)
															&& (href !== undefined)) {
														tag = '<a href="'
																+ href + '">'
																+ tag + '</a>';
													}

													elm.html(tag);
												}
											});
						}
					};
				});

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

	var languages = [ 'en', 'es', 'it', 'pl', 'cz', 'ru', 'fr' ];

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

var toolbox = angular.module('toolbox', [ 'ngCookies', 'ngRoute', 'ngAnimate',
		'ngSanitize', 'gloria.locale', 'gloria.view', 'gloria.api',
		'ui-gravatar', 'ui.bootstrap', 'smoothScroll' ]);

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
			afterSuccess.push(then);
			if (initDone) {
				then();
			}
		}
	};

	return gEnv;
});

toolbox
		.config(function($sceDelegateProvider, $filterProvider,
				$compileProvider) {

			$sceDelegateProvider.resourceUrlWhitelist([ 'self',
					'https://rawgithub.com/fserena/**',
					'http://fserena.github.io/**' ]);

			// save references to the providers
			toolbox.lazy = {
				filter : $filterProvider.register,
				directive : $compileProvider.directive
			};
		});

toolbox.run(function($gloriaLocale, $gloriaEnv, $rootScope, $location, $window,
		$timeout, smoothScroll) {

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

	toolbox.scrollTo = function(id) {
		if (!id)
			$window.scrollTo(0, 0);
		// check if an element can be found with id attribute
		var el = document.getElementById(id);
		if (!el) {// check if an element can be found with name attribute if
			// there is no such id
			el = document.getElementsByName(id);

			if (el && el.length)
				el = el[0];
			else
				el = null;
		}

		if (el) { // if an element is found, scroll to the element
			$timeout(function(timer) {
				var options = {
					duration : 1000,
					easing : 'easeInOutQuint',
					offset : 120
				};
				smoothScroll(el, options);
				// $window.scrollTo(0, el.offsetTop - 100);
			}, 100);
		}
	};

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

toolbox.controller('LoginController', function($gloriaAPI, $scope, $location,
		Login, $gloriaView, $timeout) {

	$scope.loaded = false;
	$scope.login = {};
	$scope.login.user = null;
	$scope.login.screen_name = null;
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
					$scope.login.disconnect();
				}

				return go;
			}

			go = view.visibility == "public"
					|| view.visibility == "only-public";

			if (go)
				return true;
		}

		if ($scope.login.user != null) {
			$scope.login.disconnect();
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
					}, function() {
						$scope.login.user = null;
						$scope.login.screen_name = null;
						$scope.login.failed = true;
						$scope.inputStyle.borderColor = 'rgb(255, 82, 0)';

					});

			Login.afterConnect(function() {
				$scope.login.user = $scope.login.email;

				var alias = Login.getUserInfo().alias;

				if (alias == null || alias == "") {
					$scope.login.screen_name = $scope.login.user;
				} else {
					$scope.login.screen_name = alias;
				}
				$scope.login.finalEmail = $scope.login.email;

				$scope.gotoMain();
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
		$scope.login.screen_name = null;
		$scope.login.email = null;
		$scope.login.password = null;
		document.execCommand("ClearAuthenticationCache");
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

		$scope.login.email = $scope.login.user;
		$scope.login.finalEmail = $scope.login.email;
		$scope.verified = true;
		var alias = Login.getUserInfo().alias;
		if (alias == null || alias == "") {
			$scope.login.screen_name = $scope.login.user;
		} else {
			$scope.login.screen_name = alias;
		}
	}, function() {
		$scope.verified = true;
		$scope.gotoWelcome();
	});
});

toolbox.service('$gloriaNav', function($http, Login, $gloriaAPI) {

	var menus = [];
	var objMenus;
	var initDone = false;
	var rawMenus = {};
	var afterSuccess = [];

	var endInitialization = function() {
		initDone = true;

		afterSuccess.forEach(function(then) {
			if (then != undefined) {
				then();
			}
		});
	};

	var refresh = function() {

		var info = Login.getUserInfo();

		menus = [];
		var role = info == null ? '' : info.roles[0];

		for ( var key in rawMenus) {

			var menu = rawMenus[key];

			var letSee = menu.visibility == undefined
					|| (menu.visibility == role);

			if (letSee) {
				menu.name = key;
				menus.push(menu);

				if (menu.child != undefined) {
					menu.child.forEach(function(child) {
						letSee = child.visibility == undefined
								|| (child.visibility == role);
						child.visible = letSee;
					});
				}
			}
		}

		objMenus = rawMenus;
		endInitialization();
	};

	var gNav = {

		init : function() {
			var url = 'conf/navbar.json';
			return $http({
				method : "GET",
				url : url,
				cache : false
			}).success(function(data) {
				rawMenus = data;
				Login.afterConnect(function() {
					refresh();
				});
				Login.afterDisconnect(function() {
					refresh();
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

toolbox
		.controller(
				'NavbarCtrl',
				function($scope, $http, $location, $window, $gloriaLocale,
						$gloriaNav, $gloriaAPI) {

					$scope.navClass = function(menu) {
						var currentRoute = $location.path();

						var cl = '';

						if ($gloriaNav.getMenu(menu).href != undefined) {
							var href = $gloriaNav.getMenu(menu).href;
							if (href.app == undefined) {
								cl = $gloriaNav.getMenu(menu).href.path === currentRoute ? 'active'
										: '';
							}
						} else {

							if ($gloriaNav.getMenu(menu).child != undefined) {
								cl += ' dropdown';

								$gloriaNav.getMenu(menu).child
										.forEach(function(child) {
											if (child.href != undefined) {
												var href = child.href;
												if (href.app == undefined) {
													cl += ' '
															+ (child.href.path === currentRoute ? 'active'
																	: '');
												}
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
