
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
	var variables = 'var game=null;var exports=window.exports;var bullets=null;';

	appCode = '(function(){' + variables + appCode + '\n(' + aimInit + ')();' + '})();';

	return appCode;
}

function patchAppCode(appCode) {
	appCode = wrapAppCode(appCode);

	var patchRules = [
		{
			name: "Export game scope",
			from: /init:function\(\){var ([a-z]),([a-z])=this.pixi.renderer/,
			to: 'init:function(){game=this;var $1,$2=this.pixi.renderer'
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
			// console.log(item.name + " patched");
		} else {
			console.log("Err patching: " + item.name);
		}
	});

	return appCode;
}

function injectScript(tabId, code) {
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

chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		if(details.url.match(/manifest/)) {
			chrome.storage.local.get(['manifestCode'], function(manifestCode) {
				if(manifestCode.manifestCode === undefined) {
		        	console.log("Executing xhr manifest request...");
					var xhr = new XMLHttpRequest();
					xhr.open("GET", details.url, true);
					xhr.send();

					xhr.onreadystatechange = function() {
						if (xhr.readyState != 4) return;
						if (this.status != 200) {
							console.log("Err getting manifest file. Page will be reloaded after 5 seconds...");
							setTimeout(function(){chrome.tabs.reload(details.tabId, null, null)}, 5000);
							return;
						}

						var patchedManifestCode = patchManifestCode(xhr.responseText);
						chrome.storage.local.set({
							'manifestCode': patchedManifestCode,
							'mainfestVer': details.url.match(/manifest\.(.*)\.js/)[1]
						}, function() {
							console.log("Manifest code stored.");
							injectScript(details.tabId, patchedManifestCode);
							return;
						});
					}
				} else {
					chrome.storage.local.get(['mainfestVer'], function(mainfestVer) {
						if(mainfestVer.mainfestVer != details.url.match(/manifest\.(.*)\.js/)[1]) {
							console.log("Executing xhr manifest update request...");
							var xhr = new XMLHttpRequest();
							xhr.open("GET", details.url, true);
							xhr.send();

							xhr.onreadystatechange = function() {
								if (xhr.readyState != 4) return;
								if (this.status != 200) {
									console.log("Err update manifest file. Page will be reloaded after 5 seconds...");
									setTimeout(function(){chrome.tabs.reload(details.tabId, null, null)}, 5000);
									return;
								}

								var patchedManifestCode = patchManifestCode(xhr.responseText);
								chrome.storage.local.set({
									'manifestCode': patchedManifestCode,
									'mainfestVer': details.url.match(/manifest\.(.*)\.js/)[1]
								}, function() {
									console.log("Manifest code updated.");
									injectScript(details.tabId, patchedManifestCode);
									return;
								});
							}
						} else {
							injectScript(details.tabId, manifestCode.manifestCode);
						}
					});
				}
			});
		}

		if(details.url.match(/vendor/)) {
			chrome.storage.local.get(['vendorCode'], function(vendorCode) {
				if(vendorCode.vendorCode === undefined) {
		        	console.log("Executing xhr vendor request...");
					var xhr = new XMLHttpRequest();
					xhr.open("GET", details.url, true);
					xhr.send();

					xhr.onreadystatechange = function() {
						if (xhr.readyState != 4) return;
						if (this.status != 200) {
							console.log("Err getting vendor file. Page will be reloaded after 5 seconds...");
							setTimeout(function(){chrome.tabs.reload(details.tabId, null, null)}, 5000);
							return;
						}

						chrome.storage.local.set({
							'vendorCode': xhr.responseText,
							'vendorVer': details.url.match(/vendor\.(.*)\.js/)[1]
						}, function() {
							console.log("Vendor code stored.");
							injectScript(details.tabId, xhr.responseText);
							return;
						});
					}
				} else {
					chrome.storage.local.get(['vendorVer'], function(vendorVer) {
						if(vendorVer.vendorVer != details.url.match(/vendor\.(.*)\.js/)[1]) {
							console.log("Executing xhr vendor update request...");
							var xhr = new XMLHttpRequest();
							xhr.open("GET", details.url, true);
							xhr.send();

							xhr.onreadystatechange = function() {
								if (xhr.readyState != 4) return;
								if (this.status != 200) {
									console.log("Err update vendor file. Page will be reloaded after 5 seconds...");
									setTimeout(function(){chrome.tabs.reload(details.tabId, null, null)}, 5000);
									return;
								}

								chrome.storage.local.set({
									'vendorCode': xhr.responseText,
									'vendorVer': details.url.match(/vendor\.(.*)\.js/)[1]
								}, function() {
									console.log("Vendor code updated.");
									injectScript(details.tabId, xhr.responseText);
									return;
								});
							}
						} else {
							injectScript(details.tabId, vendorCode.vendorCode);
						}
					});
				}
			});
		}

		if(details.url.match(/app/)) {
			chrome.storage.local.get(['appCode'], function(appCode) {
				if(appCode.appCode === undefined) {
		        	console.log("Executing xhr app request...");
					var xhr = new XMLHttpRequest();
					xhr.open("GET", details.url, true);
					xhr.send();

					xhr.onreadystatechange = function() {
						if (xhr.readyState != 4) return;
						if (this.status != 200) {
							console.log("Err getting app file. Page will be reloaded after 5 seconds...");
							setTimeout(function(){chrome.tabs.reload(details.tabId, null, null)}, 5000);
							return;
						}

						var patchedClientCode = patchAppCode(xhr.responseText);
						chrome.storage.local.set({
							'appCode': patchedClientCode,
							'appVer': details.url.match(/app\.(.*)\.js/)[1]
						}, function() {
							console.log("App code stored.");
							injectScript(details.tabId, patchedClientCode);
							return;
						});
					}
				} else {
					chrome.storage.local.get(['appVer'], function(appVer) {
						if(appVer.appVer != details.url.match(/app\.(.*)\.js/)[1]) {
							console.log("Executing xhr app update request...");
							var xhr = new XMLHttpRequest();
							xhr.open("GET", details.url, true);
							xhr.send();

							xhr.onreadystatechange = function() {
								if (xhr.readyState != 4) return;
								if (this.status != 200) {
									console.log("Err update app file. Page will be reloaded after 5 seconds...");
									setTimeout(function(){chrome.tabs.reload(details.tabId, null, null)}, 5000);
									return;
								}

								var patchedClientCode = patchAppCode(xhr.responseText);
								chrome.storage.local.set({
									'appCode': patchedClientCode,
									'appVer': details.url.match(/app\.(.*)\.js/)[1]
								}, function() {
									console.log("App code updated.");
									injectScript(details.tabId, patchedClientCode);
									return;
								});
							}
						} else {
							injectScript(details.tabId, appCode.appCode);
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
			"*://*.2dbattleroyale.com/js/app.*.js"
		],
		types: ["script"]
	},
	// extraInfoSpec
	["blocking"]
);