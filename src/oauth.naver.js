//naver start

angular.module('oauth.naver', ['oauth.utils'])
	.factory('$naver', naver);

function naver($q, $http, $cordovaOauthUtility) {
	return { signin: oauthNaver };

	/*
	 * Sign into the Naver service
	 *
	 * @param	string clientId
	 * @param	string client_secret
	 * @param	string state
	 * @param	object options
	 * @return	 promise
	 */
	function oauthNaver(clientId, client_secret, state, options) {
	var deferred = $q.defer();
	if(window.cordova) {
		if($cordovaOauthUtility.isInAppBrowserInstalled()) {
		var redirect_uri = "http://localhost/callback";
		if(options !== undefined) {
			if(options.hasOwnProperty("redirect_uri")) {
			redirect_uri = options.redirect_uri;
			}
		}
		//login
		var flowUrl = "https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=" + clientId + "&redirect_uri=" + redirect_uri + "&state="+state;
		var browserRef = window.cordova.InAppBrowser.open(flowUrl, "_blank", "location=no,clearsessioncache=yes,clearcache=yes");
		browserRef.addEventListener("loadstart", function(event) {
			if((event.url).indexOf(redirect_uri) === 0) {
			var requestCode = (event.url).split("code=")[1];
			var requestToken = requestCode.split("&")[0];
			$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
			
			//request access_token
			//you must start emulate without option -l (ionic run ios)
			var url ="https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=" + clientId+"&client_secret="+client_secret + "&code=" + requestToken+"&state="+state;
			$http({method: "get", url: url })
				.success(function(data) {
					deferred.resolve(data);
				})
				.error(function(data, status) {
					deferred.reject("Problem authenticating");
				})
				.finally(function() {
					setTimeout(function() {
						browserRef.close();
					}, 10);
			});
			
			
			}
		});
		browserRef.addEventListener('exit', function(event) {
			deferred.reject("The sign in flow was canceled");
		});
		} else {
		deferred.reject("Could not find InAppBrowser plugin");
		}
	} else {
		deferred.reject("Cannot authenticate via a web browser");
	}

	return deferred.promise;
	}
}

naver.$inject = ['$q', '$http', '$cordovaOauthUtility'];
