
function patchManifestCode(manifestCode) {
	var patchRules = [
		{
			name: "Exports exports scope",
			from: /var ([a-z])={},(.*?);/g,
			to: 'var $1={},$2;window.exports=$1;'
		}
	]

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

function findVariable(name, exports) {
	var keys = Object.keys(exports);
	for(var i = 0; i < keys.length; i++) {
		if(exports[keys[i]].exports[name]) {
			return exports[keys[i]].exports[name];
		}
	}

	return null;
}

function wrapAppCode(appCode) {
	var variables = "";
	
	variables += "var game=null;var exports=null;var bullets=null;";

	appCode = variables + appCode;

	appCode = '(function(){' + appCode;

	appCode = appCode + '\n(' + aimInit + ')();';
	appCode = appCode + '\nif(window.exports){exports=window.exports;delete window.exports;};'

	appCode = appCode +'\nbullets=(' + findVariable + ')("bullets",exports);'

	appCode = appCode + '})();';

	return appCode;
}

function patchAppCode(gameClientCode) {
	gameClientCode = wrapAppCode(gameClientCode);

	var patchRules = [
		/*
			{
				name: "Export sended data",
				from: /sendMessage:function\(([a-z]),([a-z])\){/g,
				to: 'sendMessage:function($1,$2){reviewSendedMessage($1,$2);'
			},
			{
				name: "Export game update info",
				from: /processGameUpdate:function\(([a-z])\){/g,
				to: 'processGameUpdate:function($1){reviewGameUpdateInfo($1);'
			},

			{
				name: "Export joined msg",
				from: /case ([a-z]).Msg.Joined:(.*?);([a-z]).deserialize\(([a-z])\),/g,
				to: 'case $1.Msg.Joined:$2;$3.deserialize($4),reviewJoinedMsg($3),'
			},
		*/
		{
			name: "Export game scope",
			from: /this\.activePlayer=null\,/g,
			to: 'this\.activePlayer=null\,game=this\,'
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
		},
		{
			name: "Shak alpha",
			from: /sprite\:\"img\/map\/map\-building\-shack\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
			to: 'sprite:"img/map/map-building-shack-ceiling.svg",scale:.5,alpha:0.1'
		},
		{
			name: "Outhouse alpha",
			from: /sprite\:\"img\/map\/map\-building\-outhouse\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
			to: 'sprite:"img/map/map-building-outhouse-ceiling.svg",scale:.5,alpha:0.5'
		},
		{
			name: "Panicroom alpha",
			from: /sprite:"img\/map\/map\-building\-panicroom\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
			to: 'sprite:"img/map/map-building-panicroom-ceiling.svg",scale:.5,alpha:0.5'			
		},
		{
			name: "Barn_01 alpha",
			from: /sprite\:\"img\/map\/map\-building\-barn\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
			to: 'sprite:"img/map/map-building-barn-ceiling.svg",scale:.5,alpha:0.5'
		},
		{
			name: "Bank_01 alpha",
			from: /sprite\:\"img\/map\/map\-building\-bank\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
			to: 'sprite:"img/map/map-building-bank-ceiling.svg",scale:.5,alpha:0.5'				
		},
		{
			name: "Vault_01 alpha",
			from: /sprite\:\"img\/map\/map\-building\-vault\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
			to: 'sprite:"img/map/map-building-vault-ceiling.svg",scale:.5,alpha:0.5'
		},
		{
			name: "Police_01 alpha",
			from: /sprite\:\"img\/map\/map\-building\-police\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
			to: 'sprite:"img/map/map-building-police-ceiling.svg",scale:.5,alpha:0.5'
		},
		{
			name: "House_red_01 alpha",
			from: /sprite\:\"img\/map\/map\-building\-house\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
			to: 'sprite:"img/map/map-building-house-ceiling.svg",scale:.5,alpha:0.5'			
		},
		{
			name: "Saferoom_01 alpha",
			from: /sprite\:\"img\/map\/map\-building\-saferoom\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
			to: 'sprite:"img/map/map-building-saferoom-ceiling.svg",scale:.5,alpha:0.5'			
		},
		{
			name: "Mansion_01 alpha",
			from: /sprite\:\"img\/map\/map\-building\-mansion\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
			to: 'sprite:"img/map/map-building-mansion-ceiling.svg",scale:.5,alpha:0.5'
		},
		{
			name: "Bunker_egg_sublevel_01 alpha",
			from: /sprite\:\"img\/map\/map\-bunker\-egg\-chamber\-ceiling\-01\.svg\"\,scale\:\.5\,alpha\:1/g,
			to: 'sprite:"img/map/map-bunker-egg-chamber-ceiling-01.svg",scale:.5,alpha:0.5'	
		},
		{
			name: "Bunker_hydra_01 alpha",
			from: /sprite\:\"img\/map\/map\-bunker\-hydra\-ceiling\-01\.svg\"\,pos\:L\.create\(25\.25\,3\.5\)\,scale\:\.5\,alpha\:1/g,
			to: 'sprite:"img/map/map-bunker-hydra-ceiling-01.svg",pos:L.create(25.25,3.5),scale:.5,alpha:0.5'
		},
		{
			name: "Bunker_hydra_sublevel_01 alpha",
			from: /sprite\:\"img\/map\/map\-bunker\-hydra\-chamber\-ceiling\-01\.svg\"\,pos\:L\.create\(7\,2\)\,scale\:\.5\,alpha\:1\,tint\:6250335\}\,\{sprite\:\"img\/map\/map\-bunker\-hydra\-chamber\-ceiling\-02\.svg\"\,pos\:L\.create\(\-13\.5\,\-76\.5\)\,scale\:\.5\,alpha\:1\,tint\:6250335\}\,\{sprite\:\"img\/map\/map\-bunker\-hydra\-chamber\-ceiling\-03\.svg\"\,pos\:L\.create\(38\,\-62\)\,scale\:\.5\,alpha\:1/g,
			to: 'sprite:"img/map/map-bunker-hydra-chamber-ceiling-01.svg",pos:L.create(7,2),scale:.5,alpha:0.5,tint:6250335},{sprite:"img/map/map-bunker-hydra-chamber-ceiling-02.svg",pos:L.create(-13.5,-76.5),scale:.5,alpha:0.5,tint:6250335},{sprite:"img/map/map-bunker-hydra-chamber-ceiling-03.svg",pos:L.create(38,-62),scale:.5,alpha:0.5'
		},
		{
			name: "Bunker_hydra_compartment_01 alpha",
			from: /sprite\:\"img\/map\/map\-bunker\-hydra\-compartment\-ceiling\-01\.svg\"\,pos\:L\.create\(0\,1\.25\)\,scale\:\.5\,alpha\:1/g,
			to: 'sprite:"img/map/map-bunker-hydra-compartment-ceiling-01.svg",pos:L.create(0,1.25),scale:.5,alpha:0.5'
		},
		{
			name: "Bunker_hydra_compartment_02 alpha",
			from: /sprite\:\"img\/map\/map\-bunker\-hydra\-compartment\-ceiling\-02\.svg\"\,pos\:L\.create\(0\,1\)\,scale\:\.5\,alpha\:1/g,
			to: 'sprite:"img/map/map-bunker-hydra-compartment-ceiling-02.svg",pos:L.create(0,1),scale:.5,alpha:0.5'
		},
		{
			name: "Bunker_hydra_compartment_03 alpha",
			from: /sprite\:\"img\/map\/map\-bunker\-hydra\-compartment\-ceiling\-03\.svg\"\,pos\:L\.create\(0\,1\)\,scale\:\.5\,alpha\:1/g,
			to: 'sprite:"img/map/map-bunker-hydra-compartment-ceiling-03.svg",pos:L.create(0,1),scale:.5,alpha:0.5'
		},
		{
			name: "Bunker_storm_01 alpha",
			from: /sprite\:\"img\/map\/map\-building\-shack\-ceiling\.svg\"\,pos\:L\.create\(-1\,10\)\,scale\:\.5\,alpha\:1/g,
			to: 'sprite:"img/map/map-building-shack-ceiling.svg",pos:L.create(-1,10),scale:.5,alpha:0.5'
		},
		{
			name: "Bunker_storm_sublevel_01 alpha",
			from: /sprite\:\"img\/map\/map\-bunker\-storm\-chamber\-ceiling\-01\.svg\"\,pos\:L\.create\(8\.5\,-1\)\,scale\:\.5\,alpha\:1/g,
			to: 'sprite:"img/map/map-bunker-storm-chamber-ceiling-01.svg",pos:L.create(8.5,-1),scale:.5,alpha:0.5'
		},
		{
			name: "Container alpha",
			from: /sprite\:\"img\/map\/\"\+e\.ceilingSprite\,scale\:\.5\,alpha\:1/g,
			to: 'sprite:"img/map/"+e.ceilingSprite,scale:.5,alpha:0.5'
		},
		{
			name: "Warehouse alpha",
			from: /sprite\:\"img\/map\/map\-building\-warehouse\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
			to: 'sprite:"img/map/"+e.ceilingSprite,scale:.5,alpha:0.5'
		},
		{
			name: "Tracer width",
			from: /tracerWidth:\.[0-9]+/g,
			to: 'tracerWidth:.2'
		},
		{
			name: "Scope zoom radius",
			from: /scopeZoomRadius:{.*?}/g,
			to: 'scopeZoomRadius:{"1xscope":68,"2xscope":68,"4xscope":68,"8xscope":68,"15xscope":104}'
		}
	]

	patchRules.forEach(function(item) {
		if(item.from.test(gameClientCode)) {
			gameClientCode = gameClientCode.replace(item.from, item.to);
			// console.log(item.name + " patched");
		} else {
			console.log("Err patching: " + item.name);
		}
	});

	// exportBulletsProps(gameClientCode);

	return gameClientCode;
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