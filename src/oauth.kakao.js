//kakao start
angular.module('oauth.kakao', ['oauth.utils'])
	.factory('$kakao', kakao);

function kakao($q, $http, $cordovaOauthUtility) {
	return { signin: oauthKakao };

	/*
	 * Sign into the Kakao service
	 *
	 * @param	string clientId
	 * @param	string state
	 * @param	object options
	 * @return	 promise
	 */
	function oauthKakao(clientId, state, options) {
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
		var flowUrl = "https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=" + clientId + "&redirect_uri=" + redirect_uri + "&state="+state;
		
		console.log("flowUrl:"+flowUrl);
		var browserRef = window.cordova.InAppBrowser.open(flowUrl, "_blank", "location=no,clearsessioncache=yes,clearcache=yes");
		browserRef.addEventListener("loadstart", function(event) {
			if((event.url).indexOf(redirect_uri) === 0) {
			var requestCode = (event.url).split("code=")[1];
			var requestToken = requestCode.split("&")[0];
			$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
			
			//request access_token
			//you must start emulate without option -l (ionic run ios)
			var url ="https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=" + clientId+"&redirect_uri="+redirect_uri + "&code=" + requestToken;
			$http({method: "post", url: url })
				.success(function(data) {
					console.log("ok");
					console.log(data);
					deferred.resolve(data);
				})
				.error(function(data, status) {
					console.log("fail");
					console.log(data);
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

kakao.$inject = ['$q', '$http', '$cordovaOauthUtility'];

//kakao end
