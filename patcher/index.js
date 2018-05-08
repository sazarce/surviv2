
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

var appPrint = "0ca5c0d7";
var appFolderPath = "../app/";
var appPath = appFolderPath + "app." + appPrint + ".js";
var patchedAppPath = appFolderPath + "patched/app." + appPrint + ".js";

var aimExtensionFolderPath = "../survivIoAimChromeExtension/"

fs.createReadStream(appPath).pipe(fs.createWriteStream(patchedAppPath)).on('finish', function() {
	var scopeOptions = {
		files: patchedAppPath,
		from: /this.activePlayer=null,/g,
		to: 'this.activePlayer=null,game=this,',
	};

	var alphaOptions = {
		files: patchedAppPath,
		from: /alpha:1/g,
		to: 'alpha:0.75',
	};

	var smokeAlpha = {
		files: patchedAppPath,
		from: /d.sprite.alpha=u/g,
		to: 'd.sprite.alpha=0.1',
	};

	var bushAlpha = {
		files: patchedAppPath,
		from: /alpha:.97/g,
		to: 'alpha:0.5',		
	};

	if(	safePatch("Scope", scopeOptions) && 
		safePatch("Alpha", alphaOptions) && 
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