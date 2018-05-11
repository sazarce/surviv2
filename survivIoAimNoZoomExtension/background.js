
function patchClientCode(gameClientCode) {
	gameClientCode = '(function(){var game=null;\n' + gameClientCode;
	gameClientCode = gameClientCode + '\n!function(){var e={bullet_mp5:{speed:85},bullet_ak47:{speed:100},bullet_scar:{speed:108},bullet_mosin:{speed:178},bullet_m39:{speed:125},bullet_m870:{speed:66},bullet_mp220:{speed:66},bullet_m9:{speed:85},bullet_ot38:{speed:112},bullet_mac10:{speed:75},bullet_ump9:{speed:100},bullet_dp28:{speed:110},bullet_glock:{speed:70},bullet_famas:{speed:110},bullet_hk416:{speed:105},bullet_mk12:{speed:132},bullet_m249:{speed:125},bullet_deagle:{speed:112},bullet_vector:{speed:88}},t=function(e,t,n,a){var o=a-t,i=n-e;return Math.atan2(o,i)},n=[0,1,.01,1e-4,1e-6,1e-8],a=function(e){for(var t=e*n[n.length-1],a=n.length-2;a>0;a--)t=e*(n[a]+t);return t+=n[0]},o=1,i=function(t,n,i){var u=game.camera.screenWidth/2,r=game.camera.screenHeight/2,s=r>u?u:r;return s=Math.floor(s-1),o=e["bullet_"+game.activePlayer.weapType]?90/e["bullet_"+game.activePlayer.weapType].speed:1,{x:u+s*Math.cos(t+o*a(i)/3*(t-n)),y:r-s*Math.sin(t+o*a(i)/3*(t-n))}},u={playerId:0,distance:1/0,radianAngle:0,prevRadianAngle:0,new:!1,timestamp:Date.now(),targetMousePosition:{x:0,y:0}},r=!1,s=function(e){var n=!!game.activePlayer&&game.activePlayer.pos,a=[],o=[],s=Object.keys(e);if(!s.length)return u.new=!1,void(u.timestamp=Date.now());if(r&&e[u.playerId]){var d=e[u.playerId].netData.pos,m=Math.sqrt(Math.pow(Math.abs(n.x-d.x),2)+Math.pow(Math.abs(n.y-d.y),2)),l=t(n.x,n.y,d.x,d.y);return u.distance=Math.sqrt(Math.pow(Math.abs(n.x-d.x),2)+Math.pow(Math.abs(n.y-d.y),2)),u.prevRadianAngle=u.radianAngle,u.radianAngle=l,u.new=!0,u.timestamp=Date.now(),void(u.targetMousePosition=i(u.radianAngle,u.prevRadianAngle,u.distance))}for(var p=0;p<s.length;p++){d=e[s[p]].netData.pos,m=Math.sqrt(Math.pow(Math.abs(n.x-d.x),2)+Math.pow(Math.abs(n.y-d.y),2)),l=t(n.x,n.y,d.x,d.y);a.push(m),o.push(l)}var c,g=(c=a).indexOf(Math.min.apply(null,c));u.playerId!=e[s[g]].__id?(u={playerId:e[s[g]].__id,distance:a[g],radianAngle:o[g],prevRadianAngle:o[g],new:!0,timestamp:Date.now()}).targetMousePosition=i(u.radianAngle,u.prevRadianAngle,u.distance):(u.distance=a[g],u.prevRadianAngle=u.radianAngle,u.radianAngle=o[g],u.new=!0,u.timestamp=Date.now(),u.targetMousePosition=i(u.radianAngle,u.prevRadianAngle,u.distance))},d=function(){!1===game.gameOver?(s(function(){var e=[];if(!game.playerBarn.playerInfo[game.activeId])return e;for(var t=game.playerBarn.playerInfo[game.activeId].teamId,n=game.activeId,a=(Object.keys(game.objectCreator.idToObj),Object.keys(game.playerBarn.playerInfo)),o=0;o<a.length;o++)!game.objectCreator.idToObj[a[o]]||game.objectCreator.idToObj[a[o]].netData.dead||game.objectCreator.idToObj[a[o]].netData.downed||game.playerBarn.playerInfo[a[o]].teamId==t||a[o]!=n&&(e[a[o]]=game.objectCreator.idToObj[a[o]]);return e}()),u.new&&(game.input.mousePos=u.targetMousePosition)):f()},m=function(){document.removeEventListener("keydown",function(e){32==e.which&&(game.input.mouseButton=!0)}),document.removeEventListener("keyup",function(e){32==e.which&&(game.input.mouseButton=!1)})},l=function(){document.removeEventListener("keyup",function(e){79==e.which&&(r=!r)})},p=null;function c(){p=setTimeout(c,10),d()}var g=function(e){},v=function(e){},w=function(){g=game.input.bOnMouseDown,v=game.input.bOnMouseMove,window.removeEventListener("mousedown",game.input.bOnMouseDown),window.removeEventListener("mousemove",game.input.bOnMouseMove),window.addEventListener("mousedown",function(e){!e.button&&u.new?(game.input.mousePos=u.targetMousePosition,game.input.mouseButtonOld=!1,game.input.mouseButton=!0):g(e)}),window.addEventListener("mousemove",function(e){u.new||v(e)}),m(),document.addEventListener("keydown",function(e){32==e.which&&(game.input.mouseButton=!0)}),document.addEventListener("keyup",function(e){32==e.which&&(game.input.mouseButton=!1)}),l(),document.addEventListener("keyup",function(e){79==e.which&&(r=!r)})},b=function(){window.removeEventListener("mousedown",function(e){!e.button&&u.new?(game.input.mousePos=u.targetMousePosition,game.input.mouseButtonOld=!1,game.input.mouseButton=!0):g(e)}),window.removeEventListener("mousemove",function(e){u.new||v(e)}),window.addEventListener("mousedown",g),window.addEventListener("mousemove",v),m(),l()},h=!1;function y(){!1===game.gameOver&&(w(),h=!0,p&&(clearTimeout(p),p=null),c())}function f(){p&&(clearTimeout(p),p=null),b(),h=!1,r=!1}document.removeEventListener("keyup",function(e){90==e.which&&(h?f():y())}),document.addEventListener("keyup",function(e){90==e.which&&(h?f():y())})}();';
	gameClientCode = gameClientCode + '\n})();';

	var scopeOptions = {		
		from: /this\.activePlayer=null\,/g,
		to: 'this\.activePlayer=null\,game=this\,'
	};

	var smokeAlpha = {		
		from: /m\.sprite\.alpha=u/g,
		to: 'm\.sprite\.alpha=0.1'
	};

	var bushAlpha = {		
		from: /alpha\:\.97/g,
		to: 'alpha\:0.5'
	};

	var tree_01Alpha = {		
		from: /residue\:\"img\/map\/map\-tree\-res\.svg\"\,scale\:\.7\,alpha\:1/g,
		to: 'residue:"img/map/map-tree-res.svg",scale:.7,alpha:0.5'
	}

	var tree_02Alpha = {		
		from: /sprite\:\"img\/map\/map\-tree\-03\.svg\"\,residue\:\"img\/map\/map\-tree\-res\.svg\"\,scale\:1\,alpha\:1/g,
		to: 'sprite:"img/map/map-tree-03.svg",residue:"img/map/map-tree-res.svg",scale:1,alpha:0.5'
	}

	var shackAlpha = {		
		from: /sprite\:\"img\/map\/map\-building\-shack\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-building-shack-ceiling.svg",scale:.5,alpha:0.1'
	}

	var outhouseAlpha = {		
		from: /sprite\:\"img\/map\/map\-building\-outhouse\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-building-outhouse-ceiling.svg",scale:.5,alpha:0.5'
	}

	var panicroomAlpha = {		
		from: /sprite:"img\/map\/map\-building\-panicroom\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-building-panicroom-ceiling.svg",scale:.5,alpha:0.5'
	}

	var barn_01Alpha = {		
		from: /sprite\:\"img\/map\/map\-building\-barn\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-building-barn-ceiling.svg",scale:.5,alpha:0.5'
	}

	var bank_01Alpha = {		
		from: /sprite\:\"img\/map\/map\-building\-bank\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-building-bank-ceiling.svg",scale:.5,alpha:0.5'
	}

	var vault_01Alpha = {		
		from: /sprite\:\"img\/map\/map\-building\-vault\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-building-vault-ceiling.svg",scale:.5,alpha:0.5'
	}

	var police_01Alpha = {		
		from: /sprite\:\"img\/map\/map\-building\-police\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-building-police-ceiling.svg",scale:.5,alpha:0.5'
	}

	var house_red_01Alpha = {		
		from: /sprite\:\"img\/map\/map\-building\-house\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-building-house-ceiling.svg",scale:.5,alpha:0.5'
	}

	var saferoom_01Alpha = {		
		from: /sprite\:\"img\/map\/map\-building\-saferoom\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-building-saferoom-ceiling.svg",scale:.5,alpha:0.5'
	}

	var mansion_01Alpha = {		
		from: /sprite\:\"img\/map\/map\-building\-mansion\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-building-mansion-ceiling.svg",scale:.5,alpha:0.5'
	}

	var bunker_egg_sublevel_01Alpha = {		
		from: /sprite\:\"img\/map\/map\-bunker\-egg\-chamber\-ceiling\-01\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-bunker-egg-chamber-ceiling-01.svg",scale:.5,alpha:0.5'	
	}

	var bunker_hydra_01Alpha = {		
		from: /sprite\:\"img\/map\/map\-bunker\-hydra\-ceiling\-01\.svg\"\,pos\:L\.create\(25\.25\,3\.5\)\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-bunker-hydra-ceiling-01.svg",pos:L.create(25.25,3.5),scale:.5,alpha:0.5'
	}
	
	var bunker_hydra_sublevel_01Alpha = {		
		from: /sprite\:\"img\/map\/map\-bunker\-hydra\-chamber\-ceiling\-01\.svg\"\,pos\:L\.create\(7\,2\)\,scale\:\.5\,alpha\:1\,tint\:6250335\}\,\{sprite\:\"img\/map\/map\-bunker\-hydra\-chamber\-ceiling\-02\.svg\"\,pos\:L\.create\(\-13\.5\,\-76\.5\)\,scale\:\.5\,alpha\:1\,tint\:6250335\}\,\{sprite\:\"img\/map\/map\-bunker\-hydra\-chamber\-ceiling\-03\.svg\"\,pos\:L\.create\(38\,\-62\)\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-bunker-hydra-chamber-ceiling-01.svg",pos:L.create(7,2),scale:.5,alpha:0.5,tint:6250335},{sprite:"img/map/map-bunker-hydra-chamber-ceiling-02.svg",pos:L.create(-13.5,-76.5),scale:.5,alpha:0.5,tint:6250335},{sprite:"img/map/map-bunker-hydra-chamber-ceiling-03.svg",pos:L.create(38,-62),scale:.5,alpha:0.5'
	}

	var bunker_hydra_compartment_01Alpha = {		
		from: /sprite\:\"img\/map\/map\-bunker\-hydra\-compartment\-ceiling\-01\.svg\"\,pos\:L\.create\(0\,1\.25\)\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-bunker-hydra-compartment-ceiling-01.svg",pos:L.create(0,1.25),scale:.5,alpha:0.5'
	}

	var bunker_hydra_compartment_02Alpha = {		
		from: /sprite\:\"img\/map\/map\-bunker\-hydra\-compartment\-ceiling\-02\.svg\"\,pos\:L\.create\(0\,1\)\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-bunker-hydra-compartment-ceiling-02.svg",pos:L.create(0,1),scale:.5,alpha:0.5'
	}

	var bunker_hydra_compartment_03Alpha = {		
		from: /sprite\:\"img\/map\/map\-bunker\-hydra\-compartment\-ceiling\-03\.svg\"\,pos\:L\.create\(0\,1\)\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-bunker-hydra-compartment-ceiling-03.svg",pos:L.create(0,1),scale:.5,alpha:0.5'
	}

	var bunker_storm_01Alpha = {		
		from: /sprite\:\"img\/map\/map\-building\-shack\-ceiling\.svg\"\,pos\:L\.create\(-1\,10\)\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-building-shack-ceiling.svg",pos:L.create(-1,10),scale:.5,alpha:0.5'
	}

	var bunker_storm_sublevel_01Alpha = {		
		from: /sprite\:\"img\/map\/map\-bunker\-storm\-chamber\-ceiling\-01\.svg\"\,pos\:L\.create\(8\.5\,-1\)\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-bunker-storm-chamber-ceiling-01.svg",pos:L.create(8.5,-1),scale:.5,alpha:0.5'
	}

	var containerAlpha = {		
		from: /sprite\:\"img\/map\/\"\+e\.ceilingSprite\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/"+e.ceilingSprite,scale:.5,alpha:0.5'	
	}

	var warehouseAlpha = {		
		from: /sprite\:\"img\/map\/map\-building\-warehouse\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/"+e.ceilingSprite,scale:.5,alpha:0.5'
	}

	gameClientCode = gameClientCode.replace(scopeOptions.from, scopeOptions.to);
	gameClientCode = gameClientCode.replace(smokeAlpha.from, smokeAlpha.to);

	gameClientCode = gameClientCode.replace(bushAlpha.from, bushAlpha.to);
	gameClientCode = gameClientCode.replace(tree_01Alpha.from, tree_01Alpha.to);
	
	
	gameClientCode = gameClientCode.replace(tree_02Alpha.from, tree_02Alpha.to);
	gameClientCode = gameClientCode.replace(shackAlpha.from, shackAlpha.to);
	gameClientCode = gameClientCode.replace(outhouseAlpha.from, outhouseAlpha.to);
	gameClientCode = gameClientCode.replace(panicroomAlpha.from, panicroomAlpha.to);
	gameClientCode = gameClientCode.replace(barn_01Alpha.from, barn_01Alpha.to);
	gameClientCode = gameClientCode.replace(bank_01Alpha.from, bank_01Alpha.to);
	gameClientCode = gameClientCode.replace(vault_01Alpha.from, vault_01Alpha.to);
	gameClientCode = gameClientCode.replace(police_01Alpha.from, police_01Alpha.to);
	gameClientCode = gameClientCode.replace(house_red_01Alpha.from, house_red_01Alpha.to);
	gameClientCode = gameClientCode.replace(saferoom_01Alpha.from, saferoom_01Alpha.to);
	gameClientCode = gameClientCode.replace(mansion_01Alpha.from, mansion_01Alpha.to);
	gameClientCode = gameClientCode.replace(bunker_egg_sublevel_01Alpha.from, bunker_egg_sublevel_01Alpha.to);
	gameClientCode = gameClientCode.replace(bunker_hydra_01Alpha.from, bunker_hydra_01Alpha.to);
	gameClientCode = gameClientCode.replace(bunker_hydra_sublevel_01Alpha.from, bunker_hydra_sublevel_01Alpha.to);

	gameClientCode = gameClientCode.replace(bunker_hydra_compartment_01Alpha.from, bunker_hydra_compartment_01Alpha.to);
	gameClientCode = gameClientCode.replace(bunker_hydra_compartment_02Alpha.from, bunker_hydra_compartment_02Alpha.to);
	gameClientCode = gameClientCode.replace(bunker_hydra_compartment_03Alpha.from, bunker_hydra_compartment_03Alpha.to);
	gameClientCode = gameClientCode.replace(bunker_storm_01Alpha.from, bunker_storm_01Alpha.to);
	gameClientCode = gameClientCode.replace(bunker_storm_sublevel_01Alpha.from, bunker_storm_sublevel_01Alpha.to);

	gameClientCode = gameClientCode.replace(containerAlpha.from, containerAlpha.to);
	gameClientCode = gameClientCode.replace(warehouseAlpha.from, warehouseAlpha.to);

	return gameClientCode;
}

chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		chrome.tabs.query(
			{ 
				currentWindow: true, 
				active: true 
			},
			function(tabArray) {
				if(!tabArray.length) {
					console.log("Can't find a game tab. Please go to the game tab and refresh it.")
					return;
				}

				var currentTabId = tabArray[0].id;
				
				if(details.url.match(/manifest/)) {
					chrome.storage.local.get(['mainfestCode'], function(mainfestCode) {
						if(mainfestCode.mainfestCode === undefined) {
				        	console.log("Executing xhr manifest request...");
							var xhr = new XMLHttpRequest();
							xhr.open("GET", details.url, true);
							xhr.send();

							xhr.onreadystatechange = function() {
								if (xhr.readyState != 4) return;
								if (this.status != 200) {
									console.log("Err getting manifest file. Page will be reloaded after 5 seconds...");
									setTimeout(function(){chrome.tabs.reload(currentTabId, null, null)}, 5000);
									return;
								}

								chrome.storage.local.set({
									'mainfestCode': xhr.responseText,
									'mainfestVer': details.url.match(/manifest\.(.*)\.js/)[1]
								}, function() {
									console.log("Manifest code stored.");
									chrome.tabs.executeScript(currentTabId, {
										code: xhr.responseText
									});
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
											setTimeout(function(){chrome.tabs.reload(currentTabId, null, null)}, 5000);
											return;
										}

										chrome.storage.local.set({
											'mainfestCode': xhr.responseText,
											'mainfestVer': details.url.match(/manifest\.(.*)\.js/)[1]
										}, function() {
											console.log("Manifest code updated.");
											chrome.tabs.executeScript(currentTabId, {
												code: xhr.responseText
											});
											return;
										});
									}
								} else {
									chrome.tabs.executeScript(currentTabId, {
										code: mainfestCode.mainfestCode
									});
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
									setTimeout(function(){chrome.tabs.reload(currentTabId, null, null)}, 5000);
									return;
								}

								chrome.storage.local.set({
									'vendorCode': xhr.responseText,
									'vendorVer': details.url.match(/vendor\.(.*)\.js/)[1]
								}, function() {
									console.log("Vendor code stored.");
									chrome.tabs.executeScript(currentTabId, {
										code: xhr.responseText
									});
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
											setTimeout(function(){chrome.tabs.reload(currentTabId, null, null)}, 5000);
											return;
										}

										chrome.storage.local.set({
											'vendorCode': xhr.responseText,
											'vendorVer': details.url.match(/vendor\.(.*)\.js/)[1]
										}, function() {
											console.log("Vendor code updated.");
											chrome.tabs.executeScript(currentTabId, {
												code: xhr.responseText
											});
											return;
										});
									}
								} else {
									chrome.tabs.executeScript(currentTabId, {
										code: vendorCode.vendorCode
									});
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
									setTimeout(function(){chrome.tabs.reload(currentTabId, null, null)}, 5000);
									return;
								}

								var patchedClientCode = patchClientCode(xhr.responseText);
								chrome.storage.local.set({
									'appCode': patchedClientCode,
									'appVer': details.url.match(/app\.(.*)\.js/)[1]
								}, function() {
									console.log("App code stored.");
									chrome.tabs.executeScript(currentTabId, {
										code: patchedClientCode
									});

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
											setTimeout(function(){chrome.tabs.reload(currentTabId, null, null)}, 5000);
											return;
										}

										chrome.storage.local.set({
											'appCode': xhr.responseText,
											'appVer': details.url.match(/app\.(.*)\.js/)[1]
										}, function() {
											console.log("App code updated.");
											chrome.tabs.executeScript(currentTabId, {
												code: xhr.responseText
											});
											return;
										});
									}
								} else {
									chrome.tabs.executeScript(currentTabId, {
										code: appCode.appCode
									});
								}
							});
						}
					});
				}
			}
		);

		return {
			cancel: true
		}
	},
	// filters
	{
		urls: [
			"*://*.surviv.io/js/manifest.*.js",
			"*://*.surviv.io/js/vendor.*.js",
			"*://*.surviv.io/js/app.*.js"
		],
		types: ["script"]
	},
	// extraInfoSpec
	["blocking"]
);