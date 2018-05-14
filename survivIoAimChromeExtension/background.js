
function patchManifestCode(manifestCode) {
	var patchRules = [
		{
			name: "Exports exports scope",
			from: /var ([a-z])={},(.*?);/g,
			to: 'var $1={},$2;window.exports=$1;'
		}
	];

	patchRules.forEach(function(item) {
		if(item.from.test(manifestCode)) {
			manifestCode = manifestCode.replace(item.from, item.to);
			console.log(item.name + " patched");
		} else {
			console.log("Err patching: " + item.name);
		}
	});

	return manifestCode;
}

function wrapAppCode(appCode) {
	var variables = 'var game={scope:null};var exports=window.exports;var bullets=null;';

	appCode = '(function(){' + variables + appCode + '\n(' + aimInit + ')(exports, game);' + '})();';

	return appCode;
}

function patchAppCode(appCode) {
	appCode = wrapAppCode(appCode);

	var patchRules = [
		{
			name: "Export game scope",
			from: /init:function\(\){var ([a-z]),([a-z])=this.pixi.renderer/,
			to: 'init:function(){game.scope=this;var $1,$2=this.pixi.renderer'
		},

		{
			name: "Change removeAds function",
			from: /removeAds:function\(\)/g,
			to: 'removeAds:function(){},_removeAds:function()'
		},
		{
			name: "Smoke gernage alpha",
			from: /sprite.tint=([a-z]).tint,([a-z]).sprite.alpha=[a-z],([a-z]).sprite.visible=([a-z]).active/g,
			to: 'sprite.tint=$1.tint,$2.sprite.alpha=0.1,$3.sprite.visible=$4.active'
		},
		{
			name: "Bush alpha",
			from: /residue:\"img\/map\/map-bush-res-01.svg\",scale:.5,alpha:.97/g,
			to: 'residue:"img/map/map-bush-res-01.svg",scale:.5,alpha:.5'
		},
		{
			name: "Tree_01 alpha",
			from: /residue\:\"img\/map\/map\-tree\-res\.svg\"\,scale\:\.7\,alpha\:1/g,
			to: 'residue:"img/map/map-tree-res.svg",scale:.7,alpha:0.5'
		},
		{
			name: "Tree_02 alpha",
			from: /sprite\:\"img\/map\/map\-tree\-03\.svg\"\,residue\:\"img\/map\/map\-tree\-res\.svg\"\,scale\:1\,alpha\:1/g,
			to: 'sprite:"img/map/map-tree-03.svg",residue:"img/map/map-tree-res.svg",scale:1,alpha:0.5'
		}
	]

	patchRules.forEach(function(item) {
		if(item.from.test(appCode)) {
			appCode = appCode.replace(item.from, item.to);
		} else {
			console.log("Err patching: " + item.name);
		}
	});

	return appCode;
}

var codeInjector = (function(){
	var _manifestCode = null;
	var _vendorCode = null;
	var _appCode = null;

	var setManifestCode = function(manifestCode) {
		_manifestCode = manifestCode;
	}

	var setVendorCode = function(vendorCode) {
		_vendorCode = vendorCode;
	}

	var setAppCode = function(appCode) {
		_appCode = appCode;
	}

	var injectCode = function(tabId, code) {
		chrome.tabs.get(tabId, function(tab) {
			if(chrome.runtime.lastError) {
				console.log(chrome.runtime.lastError.message.toString());
				return;
			} else {
				chrome.tabs.executeScript(tabId, {
					code: code
				});
			}
		});
	};

	var tryToInjectCode = function(tabId) {
		if(_manifestCode && _vendorCode && _appCode) {
			injectCode(tabId, _manifestCode);
			injectCode(tabId, _vendorCode);
			injectCode(tabId, _appCode);

			_manifestCode = _vendorCode = _appCode = null;
			return;
		}
	}

	return {
		setManifestCode: setManifestCode,
		setVendorCode: setVendorCode,
		setAppCode: setAppCode,
		tryToInjectCode: tryToInjectCode
	}
})();

function updateManifestCode(url, onSuccess, onError) {
    console.log("Executing xhr manifest request...");
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.send();

	xhr.onreadystatechange = function() {
		if (xhr.readyState != 4) return;
		if (this.status != 200) {
			return onError();
		}

		var patchedManifestCode = patchManifestCode(xhr.responseText);
		chrome.storage.local.set({
			'manifestCode': patchedManifestCode,
			'mainfestVer': url.match(/manifest\.(.*)\.js/)[1]
		}, function() {
			return onSuccess(patchedManifestCode);
		});
	}
}

function updateVendorCode(url, onSuccess, onError) {
	console.log("Executing xhr vendor request...");
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.send();

	xhr.onreadystatechange = function() {
		if (xhr.readyState != 4) return;
		if (this.status != 200) {
			return onError();
		}

		chrome.storage.local.set({
			'vendorCode': xhr.responseText,
			'vendorVer': url.match(/vendor\.(.*)\.js/)[1]
		}, function() {
			return onSuccess(xhr.responseText);
		});
	}
}

function updateAppCode(url, onSuccess, onError) {
	console.log("Executing xhr app request...");
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.send();

	xhr.onreadystatechange = function() {
		if (xhr.readyState != 4) return;
		if (this.status != 200) {
			return onError();
		}

		var patchedAppCode = patchAppCode(xhr.responseText);
		chrome.storage.local.set({
			'appCode': patchedAppCode,
			'appVer': url.match(/app\.(.*)\.js/)[1]
		}, function() {
			return onSuccess(patchedAppCode);
		});
	}
}

chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		// todo: if request has been sended
		if(details.url.match(/manifest/)) {
			chrome.storage.local.get(['manifestCode'], function(manifestCode) {
				if(manifestCode.manifestCode === undefined) {
					updateManifestCode(details.url, function(patchedManifestCode) {
						console.log("Manifest code updated.");
						codeInjector.setManifestCode(patchedManifestCode);
						codeInjector.tryToInjectCode(details.tabId);
					}, function(){
						console.log("Err getting manifest file. Page will be reloaded after 5 seconds...");
						setTimeout(function(){chrome.tabs.reload(details.tabId, null, null)}, 5000);
					});
				} else {
					chrome.storage.local.get(['mainfestVer'], function(mainfestVer) {
						if(mainfestVer.mainfestVer != details.url.match(/manifest\.(.*)\.js/)[1]) {
							updateManifestCode(details.url, function(patchedManifestCode) {
								console.log("Manifest code updated.");
								codeInjector.setManifestCode(patchedManifestCode);
								codeInjector.tryToInjectCode(details.tabId);
							}, function(){
								console.log("Err getting manifest file. Page will be reloaded after 5 seconds...");
								setTimeout(function(){chrome.tabs.reload(details.tabId, null, null)}, 5000);
							});
						} else {
							codeInjector.setManifestCode(manifestCode.manifestCode);
							codeInjector.tryToInjectCode(details.tabId);
						}
					});
				}
			});
		}

		if(details.url.match(/vendor/)) {
			chrome.storage.local.get(['vendorCode'], function(vendorCode) {
				if(vendorCode.vendorCode === undefined) {
					updateVendorCode(details.url, function(vendorCode) {
						console.log("Vendor code updated.");
						codeInjector.setVendorCode(vendorCode);
						codeInjector.tryToInjectCode(details.tabId);
					}, function(){
						console.log("Err update vendor file. Page will be reloaded after 5 seconds...");
						setTimeout(function(){chrome.tabs.reload(details.tabId, null, null)}, 5000);
					});
				} else {
					chrome.storage.local.get(['vendorVer'], function(vendorVer) {
						if(vendorVer.vendorVer != details.url.match(/vendor\.(.*)\.js/)[1]) {
							updateVendorCode(details.url, function(vendorCode) {
								console.log("Vendor code updated.");
								codeInjector.setVendorCode(vendorCode);
								codeInjector.tryToInjectCode(details.tabId);
							}, function(){
								console.log("Err update vendor file. Page will be reloaded after 5 seconds...");
								setTimeout(function(){chrome.tabs.reload(details.tabId, null, null)}, 5000);
							});
						} else {
							codeInjector.setVendorCode(vendorCode.vendorCode);
							codeInjector.tryToInjectCode(details.tabId);
						}
					});
				}
			});
		}

		if(details.url.match(/app/)) {
			chrome.storage.local.get(['appCode'], function(appCode) {
				if(appCode.appCode === undefined) {
					updateAppCode(details.url, function(patchedAppCode) {
						console.log("App code updated.");
						codeInjector.setAppCode(patchedAppCode);
						codeInjector.tryToInjectCode(details.tabId);
					}, function(){
						console.log("Err update app file. Page will be reloaded after 5 seconds...");
						setTimeout(function(){chrome.tabs.reload(details.tabId, null, null)}, 5000);
					});
				} else {
					chrome.storage.local.get(['appVer'], function(appVer) {
						if(appVer.appVer != details.url.match(/app\.(.*)\.js/)[1]) {
							updateAppCode(details.url, function(patchedAppCode) {
								console.log("App code updated.");
								codeInjector.setAppCode(patchedAppCode);
								codeInjector.tryToInjectCode(details.tabId);
							}, function(){
								console.log("Err update app file. Page will be reloaded after 5 seconds...");
								setTimeout(function(){chrome.tabs.reload(details.tabId, null, null)}, 5000);
							});
						} else {
							codeInjector.setAppCode(appCode.appCode);
							codeInjector.tryToInjectCode(details.tabId);
						}
					});
				}
			});
		}

		return {
			cancel: true
		}
	},
	// filters
	{
		urls: [
			"*://*.surviv.io/js/manifest.*.js",
			"*://*.surviv.io/js/vendor.*.js",
			"*://*.surviv.io/js/app.*.js",
			"*://*.surviv2.io/js/manifest.*.js",
			"*://*.surviv2.io/js/vendor.*.js",
			"*://*.surviv2.io/js/app.*.js",
			"*://*.2dbattleroyale.com/js/manifest.*.js",
			"*://*.2dbattleroyale.com/js/vendor.*.js",
			"*://*.2dbattleroyale.com/js/app.*.js",
			"*://*.2dbattleroyale.org/js/manifest.*.js",
			"*://*.2dbattleroyale.org/js/vendor.*.js",
			"*://*.2dbattleroyale.org/js/app.*.js",
		],
		types: ["script"]
	},
	// extraInfoSpec
	["blocking"]
);