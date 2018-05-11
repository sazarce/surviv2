
var fs = require('fs');
var replace = require('replace-in-file');

function safePatch(name, options) {
	try {
		var changes = replace.sync(options);
		if(changes.length > 0) {
			console.log("+" + name + " patched: " + changes.join(', '));	
		} else {
			console.log("+" + name + " patched: <Not changed>");	
		}
		
		return true;
	}
	catch (error) {
		console.log("-" + name + " patching error: ", error);
		return false;
	}
}

var aimScriptPath = "../survivIoAim.js";

var appPrint = "b9dc574e";
var appFolderPath = "../app/";
var appPath = appFolderPath + "app." + appPrint + ".js";
var patchedAppPath = appFolderPath + "patched/app." + appPrint + ".js";

var aimExtensionFolderPath = "../survivIoAimChromeExtension/"

fs.createReadStream(appPath).pipe(fs.createWriteStream(patchedAppPath)).on('finish', function() {
	var scopeOptions = {
		files: patchedAppPath,
		from: /this\.activePlayer=null\,/g,
		to: 'this\.activePlayer=null\,game=this\,',
	};

	var smokeAlpha = {
		files: patchedAppPath,
		from: /m\.sprite\.alpha=u/g,
		to: 'm\.sprite\.alpha=0.1'
	};

	var bushAlpha = {
		files: patchedAppPath,
		from: /alpha\:\.97/g,
		to: 'alpha\:0.5'
	};

	var tree_01Alpha = {
		files: patchedAppPath,
		from: /residue\:\"img\/map\/map\-tree\-res\.svg\"\,scale\:\.7\,alpha\:1/g,
		to: 'residue:"img/map/map-tree-res.svg",scale:.7,alpha:0.5'
	}

	var tree_02Alpha = {
		files: patchedAppPath,
		from: /sprite\:\"img\/map\/map\-tree\-03\.svg\"\,residue\:\"img\/map\/map\-tree\-res\.svg\"\,scale\:1\,alpha\:1/g,
		to: 'sprite:"img/map/map-tree-03.svg",residue:"img/map/map-tree-res.svg",scale:1,alpha:0.5'
	}

	var shackAlpha = {
		files: patchedAppPath,
		from: /sprite\:\"img\/map\/map\-building\-shack\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-building-shack-ceiling.svg",scale:.5,alpha:0.1'
	}

	var outhouseAlpha = {
		files: patchedAppPath,
		from: /sprite\:\"img\/map\/map\-building\-outhouse\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-building-outhouse-ceiling.svg",scale:.5,alpha:0.5'
	}

	var panicroomAlpha = {
		files: patchedAppPath,
		from: /sprite:"img\/map\/map\-building\-panicroom\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-building-panicroom-ceiling.svg",scale:.5,alpha:0.5'
	}

	var barn_01Alpha = {
		files: patchedAppPath,
		from: /sprite\:\"img\/map\/map\-building\-barn\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-building-barn-ceiling.svg",scale:.5,alpha:0.5'
	}

	var bank_01Alpha = {
		files: patchedAppPath,
		from: /sprite\:\"img\/map\/map\-building\-bank\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-building-bank-ceiling.svg",scale:.5,alpha:0.5'
	}

	var vault_01Alpha = {
		files: patchedAppPath,
		from: /sprite\:\"img\/map\/map\-building\-vault\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-building-vault-ceiling.svg",scale:.5,alpha:0.5'
	}

	var police_01Alpha = {
		files: patchedAppPath,
		from: /sprite\:\"img\/map\/map\-building\-police\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-building-police-ceiling.svg",scale:.5,alpha:0.5'
	}

	var house_red_01Alpha = {
		files: patchedAppPath,
		from: /sprite\:\"img\/map\/map\-building\-house\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-building-house-ceiling.svg",scale:.5,alpha:0.5'
	}

	var saferoom_01Alpha = {
		files: patchedAppPath,
		from: /sprite\:\"img\/map\/map\-building\-saferoom\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-building-saferoom-ceiling.svg",scale:.5,alpha:0.5'
	}

	var mansion_01Alpha = {
		files: patchedAppPath,
		from: /sprite\:\"img\/map\/map\-building\-mansion\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-building-mansion-ceiling.svg",scale:.5,alpha:0.5'
	}

	var bunker_egg_sublevel_01Alpha = {
		files: patchedAppPath,
		from: /sprite\:\"img\/map\/map\-bunker\-egg\-chamber\-ceiling\-01\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-bunker-egg-chamber-ceiling-01.svg",scale:.5,alpha:0.5'	
	}

	var bunker_hydra_01Alpha = {
		files: patchedAppPath,
		from: /sprite\:\"img\/map\/map\-bunker\-hydra\-ceiling\-01\.svg\"\,pos\:L\.create\(25\.25\,3\.5\)\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-bunker-hydra-ceiling-01.svg",pos:L.create(25.25,3.5),scale:.5,alpha:0.5'
	}
	
	var bunker_hydra_sublevel_01Alpha = {
		files: patchedAppPath,
		from: /sprite\:\"img\/map\/map\-bunker\-hydra\-chamber\-ceiling\-01\.svg\"\,pos\:L\.create\(7\,2\)\,scale\:\.5\,alpha\:1\,tint\:6250335\}\,\{sprite\:\"img\/map\/map\-bunker\-hydra\-chamber\-ceiling\-02\.svg\"\,pos\:L\.create\(\-13\.5\,\-76\.5\)\,scale\:\.5\,alpha\:1\,tint\:6250335\}\,\{sprite\:\"img\/map\/map\-bunker\-hydra\-chamber\-ceiling\-03\.svg\"\,pos\:L\.create\(38\,\-62\)\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-bunker-hydra-chamber-ceiling-01.svg",pos:L.create(7,2),scale:.5,alpha:0.5,tint:6250335},{sprite:"img/map/map-bunker-hydra-chamber-ceiling-02.svg",pos:L.create(-13.5,-76.5),scale:.5,alpha:0.5,tint:6250335},{sprite:"img/map/map-bunker-hydra-chamber-ceiling-03.svg",pos:L.create(38,-62),scale:.5,alpha:0.5'
	}

	var bunker_hydra_compartment_01Alpha = {
		files: patchedAppPath,
		from: /sprite\:\"img\/map\/map\-bunker\-hydra\-compartment\-ceiling\-01\.svg\"\,pos\:L\.create\(0\,1\.25\)\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-bunker-hydra-compartment-ceiling-01.svg",pos:L.create(0,1.25),scale:.5,alpha:0.5'
	}

	var bunker_hydra_compartment_02Alpha = {
		files: patchedAppPath,
		from: /sprite\:\"img\/map\/map\-bunker\-hydra\-compartment\-ceiling\-02\.svg\"\,pos\:L\.create\(0\,1\)\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-bunker-hydra-compartment-ceiling-02.svg",pos:L.create(0,1),scale:.5,alpha:0.5'
	}

	var bunker_hydra_compartment_03Alpha = {
		files: patchedAppPath,
		from: /sprite\:\"img\/map\/map\-bunker\-hydra\-compartment\-ceiling\-03\.svg\"\,pos\:L\.create\(0\,1\)\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-bunker-hydra-compartment-ceiling-03.svg",pos:L.create(0,1),scale:.5,alpha:0.5'
	}

	var bunker_storm_01Alpha = {
		files: patchedAppPath,
		from: /sprite\:\"img\/map\/map\-building\-shack\-ceiling\.svg\"\,pos\:L\.create\(-1\,10\)\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-building-shack-ceiling.svg",pos:L.create(-1,10),scale:.5,alpha:0.5'
	}

	var bunker_storm_sublevel_01Alpha = {
		files: patchedAppPath,
		from: /sprite\:\"img\/map\/map\-bunker\-storm\-chamber\-ceiling\-01\.svg\"\,pos\:L\.create\(8\.5\,-1\)\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/map-bunker-storm-chamber-ceiling-01.svg",pos:L.create(8.5,-1),scale:.5,alpha:0.5'
	}

	var containerAlpha = {
		files: patchedAppPath,
		from: /sprite\:\"img\/map\/\"\+e\.ceilingSprite\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/"+e.ceilingSprite,scale:.5,alpha:0.5'	
	}

	var warehouseAlpha = {
		files: patchedAppPath,
		from: /sprite\:\"img\/map\/map\-building\-warehouse\-ceiling\.svg\"\,scale\:\.5\,alpha\:1/g,
		to: 'sprite:"img/map/"+e.ceilingSprite,scale:.5,alpha:0.5'
	}

	if(	safePatch("Scope", scopeOptions) && 
		safePatch("Tree_01 alpha", tree_01Alpha) && 
		safePatch("Tree_02 alpha", tree_02Alpha) &&
		safePatch("Shack alpha", shackAlpha) &&
		safePatch("Outhouse alpha", outhouseAlpha) &&
		safePatch("Panicroom alpha", panicroomAlpha) &&
		safePatch("Barn_01 alpha", barn_01Alpha) &&
		safePatch("Bank_01 alpha", bank_01Alpha) &&
		safePatch("Vault_01 alpha", vault_01Alpha) &&
		safePatch("Police_01 alpha", police_01Alpha) &&
		safePatch("House_red_01 alpha", house_red_01Alpha) &&
		safePatch("Saferoom_01 alpha", saferoom_01Alpha) &&

		safePatch("Mansion_01 alpha", mansion_01Alpha) &&
		safePatch("Bunker_egg_sublevel_01 alpha", bunker_egg_sublevel_01Alpha) &&

		safePatch("Bunker_hydra_01 alpha", bunker_hydra_01Alpha) &&
		safePatch("Bunker_hydra_sublevel_01 alpha", bunker_hydra_sublevel_01Alpha) &&

		safePatch("Bunker_hydra_compartment_01 alpha", bunker_hydra_compartment_01Alpha) &&
		safePatch("Bunker_hydra_compartment_02 alpha", bunker_hydra_compartment_02Alpha) &&
		safePatch("Bunker_hydra_compartment_03 alpha", bunker_hydra_compartment_03Alpha) &&

		safePatch("Bunker_storm_01 alpha", bunker_storm_01Alpha) &&
		safePatch("Bunker_storm_sublevel_01 alpha", bunker_storm_sublevel_01Alpha) &&

		safePatch("Container alpha", containerAlpha) &&
		safePatch("Warehouse alpha", warehouseAlpha) &&
		safePatch("Smoke alpha", smokeAlpha) &&

		safePatch("Bush alpha", bushAlpha)) {
		// Modifying extension files if patched successfully
		// Modifying aim extension

		fs.createReadStream(patchedAppPath).pipe(fs.createWriteStream(aimExtensionFolderPath + "js/app." + appPrint + ".js")).on('finish', function() {
			fs.createReadStream(aimScriptPath).pipe(fs.createWriteStream(aimExtensionFolderPath + "js/app." + appPrint + ".js", { flags:'a' }).on('finish', function() {
				var codeScopeStartOptions = {
					files: aimExtensionFolderPath + "js/app." + appPrint + ".js",
					from: /webpackJsonp/g,
					to: '(function(){\nvar game=null;\nwebpackJsonp',
				}

				var codeScopeEndOptions = {
					files: aimExtensionFolderPath + "js/app." + appPrint + ".js",
					from: /}\)\(\);/g,
					to: '})();\n})();',
				}

				safePatch("Code scope start", codeScopeStartOptions);
				safePatch("Code scope end", codeScopeEndOptions);	
			}));
		});	

		var aimExtensionBackgroundOptions = {
			files: aimExtensionFolderPath + "background.js",
			from: /app..+.js/g,
			to: "app." + appPrint + ".js",	
		}

		var aimExtensionManifestOptions = {
			files: aimExtensionFolderPath + "manifest.json",
			from: /app..+.js/g,
			to: "app." + appPrint + ".js",	
		}

		safePatch("Aim extension background", aimExtensionBackgroundOptions);
		safePatch("Aim extension manifest", aimExtensionManifestOptions);
	}
});