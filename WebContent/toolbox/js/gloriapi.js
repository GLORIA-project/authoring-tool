'use strict';

/* GLORIA API variables */
 var host = 'ws.users.gloria-project.eu';
 var protocol = 'https';
 var port = '8443';
// var host = '192.168.1.42';
// var host = 'kudhlab.com';
// var protocol = 'http';
// var port = '8080';
//var host = 'localhost';
//var protocol = 'http';
//var port = '8080';

/* GLORIA module */
var gloria = angular.module('gloria.api', []);

/* CORS setup */
gloria.config([ '$httpProvider', function($httpProvider) {
	$httpProvider.defaults.useXDomain = true;
} ]);

gloria.factory('$httpWrapper',
		function($http, $cookies) {
			var authorization = null;

			return {
				setAuthorization : function(username, password) {
					authorization = 'Basic '
							+ Base64.encode(username + ':' + password);
				},
				resetAuthorization : function() {
					authorization = null;
				},
				http : function(options) {
					options.url = protocol + '://' + host + ':' + port + '/'
							+ options.url;
					options.headers = options.headers || {};

					if (authorization) {
						options.headers.authorization = authorization;
					} else {
						options.headers.authorization = 'Basic '
								+ Base64.encode('public:public');
					}

					return $http(options);
				},
				httpGeneric : function(options) {
					return $http(options);
				},
				getAuthorization : function() {
					return authorization;
				}
			};
		});

gloria.factory('GhWrapper', function($http, $cookies) {
	var wrapper = {
		http : function(options) {
			options.url = 'https://api.github.com/repos/GLORIA-project/'
					+ options.repo + '/' + options.query;
			options.headers = options.headers || {};
			return $http(options);
		}
	};

	return wrapper;
});

gloria.factory('$sequenceFactory', function($q) {

	return {
		getSequence : function() {
			var sequence = new SequenceHandler($q);
			return sequence;
		}
	};
});

function SequenceHandler($q) {
	var queue = [];

	var execNext = function() {
		var task = queue[0];
		task.f().then(function(response) {
			queue.shift();
			task.d.resolve(response);
			if (queue.length > 0)
				execNext();
		}, function(response) {
			queue.shift();
			task.d.reject(response);
		});
	};

	this.execute = function(config) {
		var d = $q.defer();
		queue.push({
			f : config,
			d : d
		});
		if (queue.length === 1)
			execNext();
		return d.promise;
	};
}

gloria.factory('$ghAPI', function(GhWrapper, $q) {
	var api = new GithubHandler(GhWrapper, $q);

	return api;
});

function GithubHandler(GhWrapper, $q) {

	this.httpWrapper = GhWrapper;

	this.setHttp = function(handler) {
		this.httpWrapper = handler;
	};

	this.processRequest = function(method, repo, query, success, error) {
		var defer = $q.defer();
		var treatAsError = function(response) {
			if (error != undefined) {
				var returnData = response.data;
				if (response.status != 401 && response.data != undefined
						&& response.data != null && response.data != '') {
					try {
						returnData = angular.fromJson(returnData);
					} catch (e) {
					}
				}
				error(returnData, response.status);
			}
			defer.reject(response);
		};

		var promise = this.httpWrapper.http({
			method : method,
			repo : repo,
			query : query
		});

		promise = promise.then(function(response) {
			if (response.status == 200) {
				if (success != undefined) {
					var returnData = response.data;
					if (response.data != undefined && response.data != null
							&& response.data != '') {
						returnData = angular.fromJson(returnData);
					}
					success(returnData, response.status);
					defer.resolve(response);
				}
			} else {
				treatAsError(response);
			}

			return response.data;

		}, function(response) {
			treatAsError(response);
		});

		return defer.promise;
	};

	this.getAllIssues = function(repo, success, error, unauthorized) {
		return this.processRequest('get', repo, 'issues', success, error,
				unauthorized);
	};

	this.getLabelIssues = function(repo, label, success, error, unauthorized) {
		return this.processRequest('get', repo, 'issues?labels=' + label,
				success, error, unauthorized);
	};

}

gloria.factory('$gloriaAPI', function($httpWrapper, $q) {
	var api = new GloriaApiHandler($httpWrapper, $q);

	return api;
});

function GloriaApiHandler($httpWrapper, $q) {

	this.httpWrapper = $httpWrapper;

	this.setHttp = function(handler) {
		this.httpWrapper = handler;
	};

	this.processGeneric = function(method, url, success, error) {
		var promise = this.httpWrapper.httpGeneric({
			method : method,
			url : url
		});

		promise = promise.then(function(response) {
			if (success != undefined) {
				var returnData = response.data;
				if (response.data != undefined && response.data != null
						&& response.data != '') {
					returnData = angular.fromJson(returnData);
				}

				success(returnData, response.status);
			}
		}, function(response) {
			if (error != undefined) {
				var returnData = response.data;
				if (response.status != 401 && response.data != undefined
						&& response.data != null && response.data != '') {
					returnData = angular.fromJson(returnData);
				}
				error(returnData, response.status);
			}
		});
	};

	this.processRequest = function(method, url, data, success, error,
			unauthorized) {

		var defer = $q.defer();

		var promise = this.httpWrapper.http({
			method : method,
			url : url,
			data : angular.toJson(data)
		});

		var treatAsError = function(response) {
			if (error != undefined) {
				var returnData = response.data;
				if (response.status != 401 && response.data != undefined
						&& response.data != null && response.data != '') {
					try {
						returnData = angular.fromJson(returnData);
					} catch (e) {
					}
				}
				error(returnData, response.status);
			}

			if (response.status == 401) {
				if (unauthorized != undefined) {
					unauthorized();
				}
			}

			defer.reject(response);

			return response.data;
		};

		promise = promise.then(function(response) {
			if (response.status == 200) {
				if (success != undefined) {
					var returnData = response.data;
					if (response.data != undefined && response.data != null
							&& response.data != '') {
						returnData = angular.fromJson(returnData);
					}

					success(returnData, response.status);
					defer.resolve(response);
				}
			} else {
				treatAsError(response);
			}
		}, function(response) {
			treatAsError(response);
		});

		return defer.promise;
	};

	/* User authentication */
	this.setCredentials = function(username, password) {
		this.httpWrapper.setAuthorization(username, password);
	};

	this.clearCredentials = function() {
		this.httpWrapper.resetAuthorization();
	};

	this.authenticate = function(success, error, unauthorized) {

		return this.processRequest('get', 'api/users/authenticate', null,
				success, error, unauthorized);
	};

	this.verifyToken = function(success, error) {

		return this.processRequest('get', 'api/users/authenticate?verify=true',
				null, success, error);
	};

	this.getUserInformation = function(success, error, unauthorized) {

		return this.processRequest('get', 'api/users/info', null, success,
				error, unauthorized);
	};

	this.getUserKarma = function(user, success, error, unauthorized) {

		return this.processGeneric('get',
				'http://users.gloria-project.eu/karma/rest/karma/execute/get_karma/'
						+ user, success, error, unauthorized);
	};

	this.registerUser = function(alias, email, password, success, error,
			unauthorized) {

		return this.processRequest('post', 'api/users/register', {
			alias : alias,
			email : email,
			password : password

		}, success, error, unauthorized);
	};

	this.resetPassword = function(email, success, error, unauthorized) {

		return this.processRequest('post', 'api/users/reset', {
			email : email
		}, success, error, unauthorized);
	};

	this.changePassword = function(password, success, error, unauthorized) {

		return this.processRequest('post', 'api/users/update', {
			password : password
		}, success, error, unauthorized);
	};

	this.setOcupation = function(ocupation, success, error, unauthorized) {

		return this.processRequest('post', 'api/users/update', {
			ocupation : ocupation
		}, success, error, unauthorized);
	};

	this.deactivateUser = function(password, success, error, unauthorized) {

		return this.processRequest('get', 'api/users/deactivate', null,
				success, error, unauthorized);
	};

	/* Telescopes management */
	this.getAllDevices = function(rt, success, error, unauthorized) {
		return this.processRequest('get', 'api/telescopes/' + rt + '/devices',
				null, success, error, unauthorized);
	};

	this.getTypeDevices = function(rt, type, success, error, unauthorized) {
		return this.processRequest('get', 'api/telescopes/' + rt
				+ '/devices?type=' + type, null, success, error, unauthorized);
	};

	/* Direct teleoperation */
	this.getMountState = function(rt, success, error, unauthorized) {
		return this.processRequest('get', 'api/teleoperation/mount/status/'
				+ rt, null, success, error, unauthorized);
	};

	this.getDomeState = function(rt, success, error, unauthorized) {
		return this.processRequest('get',
				'api/teleoperation/dome/status/' + rt, null, success, error,
				unauthorized);
	};

	this.getWeatherState = function(rt, success, error, unauthorized) {
		return this.processRequest('get', 'api/teleoperation/weather/' + rt,
				null, success, error, unauthorized);
	};

	/* Experiment reservations management */
	this.getPendingReservations = function(success, error, unauthorized) {

		return this.processRequest('get', 'api/experiments/pending', null,
				success, error, unauthorized);
	};

	this.getOfflinePendingReservations = function(success, error, unauthorized) {

		return this.processRequest('get', 'api/experiments/offline/pending',
				null, success, error, unauthorized);
	};

	this.getOnlinePendingReservations = function(success, error, unauthorized) {

		return this.processRequest('get', 'api/experiments/online/pending',
				null, success, error, unauthorized);
	};

	this.getActiveReservations = function(success, error, unauthorized) {

		return this.processRequest('get', 'api/experiments/active', null,
				success, error, unauthorized);
	};

	this.getReservationInformation = function(cid, success, error, unauthorized) {

		return this.processRequest('get', 'api/experiments/context/' + cid
				+ '/info', null, success, error, unauthorized);
	};

	this.getOfflineActiveReservations = function(success, error, unauthorized) {

		return this.processRequest('get', 'api/experiments/offline/active',
				null, success, error, unauthorized);
	};

	this.getOnlineActiveReservations = function(success, error, unauthorized) {

		return this.processRequest('get', 'api/experiments/online/active',
				null, success, error, unauthorized);
	};

	this.getAvailableReservations = function(experiment, telescopes, date,
			success, error, unauthorized) {
		return this.processRequest('post',
				'api/experiments/online/slots/available/' + date.getFullYear()
						+ '/' + date.getMonth() + '/' + date.getDate() + '/2',
				{
					experiment : experiment,
					telescopes : telescopes
				}, success, error, unauthorized);
	};

	this.getAvailableReservationsDh = function(experiment, telescopes, date,
			dh, success, error, unauthorized) {
		return this.processRequest('post',
				'api/experiments/online/slots/available/' + date.getFullYear()
						+ '/' + date.getMonth() + '/' + date.getDate() + '/'
						+ dh, {
					experiment : experiment,
					telescopes : telescopes
				}, success, error, unauthorized);
	};

	this.cancelReservation = function(rid, success, error, unauthorized) {

		return this.processRequest('get', 'api/experiments/context/' + rid
				+ '/cancel', null, success, error, unauthorized);
	};

	this.resetReservation = function(rid, success, error, unauthorized) {

		return this.processRequest('get', 'api/experiments/context/' + rid
				+ '/reset', null, success, error, unauthorized);
	};

	this.makeReservation = function(experiment, telescopes, begin, end,
			success, error, unauthorized) {

		return this.processRequest('post', 'api/experiments/online/reserve', {
			experiment : experiment,
			telescopes : telescopes,
			begin : begin,
			end : end
		}, success, error, unauthorized);
	};

	this.requestObservation = function(obj, success, error, unauthorized) {
		return this.processRequest('post', 'api/scheduler/plans/request', {
			object : obj,
			description : obj + " observation test"
		}, success, error, unauthorized);
	};

	this.getActivePlans = function(success, error, unauthorized) {
		return this.processRequest('get', 'api/scheduler/plans/active', null,
				success, error, unauthorized);
	};

	this.getInactivePlans = function(success, error, unauthorized) {
		return this.processRequest('get', 'api/scheduler/plans/inactive', null,
				success, error, unauthorized);
	};

	this.applyForOffline = function(experiment, success, error, unauthorized) {

		return this.processRequest('get',
				'api/experiments/offline/apply?experiment=' + experiment, null,
				success, error, unauthorized);
	};

	/* Experiment context management */
	this.getParameterValue = function(cid, name, success, error, unauthorized) {
		return this.processRequest('get', 'api/experiments/context/' + cid
				+ '/parameters/' + name, null, success, error, unauthorized);
	};

	this.getParameterTreeValue = function(cid, name, tree, success, error,
			unauthorized) {

		return this
				.processRequest('get', 'api/experiments/context/' + cid
						+ '/parameters/' + name + '?tree=' + tree, null,
						success, error);
	};

	this.setParameterValue = function(cid, name, value, success, error,
			unauthorized) {

		return this.processRequest('post', 'api/experiments/context/' + cid
				+ '/parameters/' + name, value, success, error, unauthorized);
	};

	this.setParameterTreeValue = function(cid, name, tree, value, success,
			error, unauthorized) {
		return this.processRequest('post', 'api/experiments/context/' + cid
				+ '/parameters/' + name + '?tree=' + tree, value, success,
				error, unauthorized);
	};

	this.executeOperation = function(cid, name, success, error, unauthorized) {
		return this.processRequest('get', 'api/experiments/context/' + cid
				+ '/execute/' + name, null, success, error, unauthorized);
	};

	this.getElapsedTime = function(cid, success, error, unauthorized) {
		return this.processRequest('get', 'api/experiments/context/' + cid
				+ '/elapsed', null, success, error, unauthorized);
	};

	this.getRemainingTime = function(cid, success, error, unauthorized) {
		return this.processRequest('get', 'api/experiments/context/' + cid
				+ '/remaining', null, success, error, unauthorized);
	};

	this.getImagesByContext = function(cid, success, error, unauthorized) {
		return this.processRequest('get', 'api/images/list/context/' + cid,
				null, success, error, unauthorized);
	};

	this.getRandomImages = function(count, success, error, unauthorized) {
		return this.processRequest('get', 'api/images/random/all/' + count,
				null, success, error, unauthorized);
	};

	this.getMyRandomImages = function(count, success, error, unauthorized) {
		return this.processRequest('get', 'api/images/random/mine/' + count,
				null, success, error, unauthorized);
	};

	this.getImagesByDate = function(year, month, day, success, error,
			unauthorized) {
		return this.processRequest('get', 'api/images/list/' + year + '/'
				+ month + '/' + day + "?complete=true&maxResults=30", null,
				success, error, unauthorized);
	};

	/* Scripting */
	this.registerScript = function(script, success, error, unauthorized) {
		return this.processRequest('post', 'api/experiments/scripts/'
				+ script.rt, script, success, error, unauthorized);
	};

	this.deleteScript = function(script, success, error, unauthorized) {
		return this.processRequest('delete', 'api/experiments/scripts/id/'
				+ script.id, null, success, error, unauthorized);
	};

	this.getTelescopeScripts = function(rt, success, error, unauthorized) {
		return this.processRequest('get', 'api/experiments/scripts/' + rt,
				null, success, error, unauthorized);
	};
}

gloria.factory('$myCookie', function() {
	function fetchValue(name) {
		var aCookie = document.cookie.split("; ");
		for (var i = 0; i < aCookie.length; i++) {
			// a name/value pair (a crumb) is separated by an equal sign
			var aCrumb = aCookie[i].split("=");
			if (name === aCrumb[0]) {
				var value = '';
				try {
					value = angular.fromJson(aCrumb[1]);
				} catch (e) {
					value = unescape(aCrumb[1]);
				}

				if (value == 'undefined')
					return undefined;
				else if (value == 'null')
					return null;

				return value;
			}
		}
		// a cookie with the requested name does not exist
		return null;
	}
	return function(name, options) {
		if (arguments.length === 1)
			return fetchValue(name);
		var cookie = name + '=';
		if (typeof options === 'object') {
			var expires = '';
			cookie += (typeof options.value === 'object') ? angular
					.toJson(options.value)
					+ ';' : options.value + ';';
			if (options.expires) {
				var date = new Date();
				date.setTime(date.getTime()
						+ (options.expires * 24 * 60 * 60 * 1000));
				expires = date.toGMTString();
			}
			cookie += (!options.session) ? 'expires=' + expires + ';' : '';
			cookie += (options.path) ? 'path=' + options.path + ';' : '';
			cookie += (options.secure) ? 'secure;' : '';
		} else {
			cookie += options + ';';
		}
		document.cookie = cookie;
	};
});

gloria.factory('Login', function($gloriaAPI, $cookieStore, $myCookie) {

	var token = $myCookie('myGloriaToken');
	var reg = new RegExp('"', 'g');

	if (token != null && token != undefined) {
		token = token.replace(reg, '');
	}

	var user = $myCookie('myGloriaUser');

	if (user != null && user != undefined) {
		user = user.replace(reg, '');
	}

	var authenticated = undefined;
	var afterDisconnectFn = [];
	var afterConnectFn = [];

	var userInfo = null;

	var notifyDisconnect = function() {
		afterDisconnectFn.forEach(function(then) {
			if (then != undefined) {
				then();
			}
		});
	};

	var notifyConnect = function() {
		afterConnectFn.forEach(function(then) {
			if (then != undefined) {
				then();
			}
		});
	};

	var clearCookies = function() {
		$cookieStore.remove('myGloriaToken');
		$myCookie('myGloriaToken', {
			path : '/',
			expires : 0
		});
		$cookieStore.remove('myGloriaUser');
		$myCookie('myGloriaUser', {
			path : '/',
			expires : 0
		});
	};

	var verifyTokenError = function(error) {
		clearCookies();
		if (error != undefined) {
			error();
		}
		notifyDisconnect();
	};

	return {
		authenticate : function(username, password) {
			$gloriaAPI.setCredentials(username, password);

			return $gloriaAPI.authenticate(function(data) {
				user = username;
				token = data;
				$cookieStore.put('myGloriaToken', data);
				$myCookie('myGloriaToken', {
					value : '%22' + token + '%22',
					path : '/',
					expires : 1
				});

				$cookieStore.put('myGloriaUser', username);
				$myCookie('myGloriaUser', {
					value : '%22' + username + '%22',
					path : '/',
					expires : 1
				});

				$gloriaAPI.setCredentials(null, token);
			}, function() {
				clearCookies();
				$gloriaAPI.clearCredentials();
				authenticated = false;
				notifyDisconnect();
			}).then(function() {
				$gloriaAPI.getUserInformation(function(info) {
					userInfo = info;
					authenticated = true;
					notifyConnect();
				}, function() {
					verifyTokenError(error);
				});
			});
		},
		getUser : function() {
			return user;
		},
		getUserInfo : function() {
			return userInfo;
		},
		isAuthenticated : function() {
			return authenticated;
		},
		disconnect : function() {
			clearCookies();
			user = null;
			token = null;
			userInfo = null;
			authenticated = false;
			$gloriaAPI.clearCredentials();
			notifyDisconnect();
		},
		getToken : function() {
			return token;
		},
		verifyToken : function(success, error) {
			if (token != undefined) {
				$gloriaAPI.setCredentials(null, token);
				$gloriaAPI.verifyToken(function(data) {
					$gloriaAPI.setCredentials(null, token);
				}, function() {
					verifyTokenError(error);
				}).then(function() {
					$gloriaAPI.getUserInformation(function(info) {
						userInfo = info;
						authenticated = true;
						success();
						notifyConnect();
					}, function() {
						verifyTokenError(error);
					});
				});
			} else {
				verifyTokenError(error);
			}
		},
		registerUser : function(alias, email, password, success, error) {
			return $gloriaAPI.registerUser(alias, email, password, success,
					error);
		},
		resetPassword : function(email, success, error) {
			return $gloriaAPI.resetPassword(email, success, error);
		},
		changePassword : function(password, success, error) {
			return $gloriaAPI.changePassword(password, success, error);
		},
		afterConnect : function(then) {
			afterConnectFn.push(then);
			if (authenticated == true) {
				then();
			}
		},
		afterDisconnect : function(then) {
			afterDisconnectFn.push(then);
			if (authenticated == false) {
				then();
			}
		}
	};
});

/**
 * 
 * Base64 encode / decode http://www.webtoolkit.info/
 * 
 */

var Base64 = {

	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	// public method for encoding
	encode : function(input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		input = Base64._utf8_encode(input);

		while (i < input.length) {

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output = output + this._keyStr.charAt(enc1)
					+ this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3)
					+ this._keyStr.charAt(enc4);

		}

		return output;
	},

	// public method for decoding
	decode : function(input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {

			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}

		}

		output = Base64._utf8_decode(output);

		return output;

	},

	// private method for UTF-8 encoding
	_utf8_encode : function(string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	},

	// private method for UTF-8 decoding
	_utf8_decode : function(utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while (i < utftext.length) {

			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if ((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i + 1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				string += String.fromCharCode(((c & 15) << 12)
						| ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}

		}

		return string;
	}
};