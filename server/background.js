var fs = require('fs');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var folderName = __dirname + "/../survivIoAimChromeExtension/"
var imports = ['autoAim.js', 'autoLoot.js', 'autoOpeningDoors.js', 'init.js', 'menu.js', 'zoomRadiusManager.js'];
var injectedCode = "";
for (var i = 0; i < imports.length; i++) {
    eval(fs.readFileSync(folderName + imports[i]).toString());
}
//console.log(autoAim);
var variableNames = {};
variableNames.game = '_' + Math.random().toString(36).substring(7);
variableNames.exports = '_' + Math.random().toString(36).substring(7);
variableNames.interactionEmitter = '_' + Math.random().toString(36).substring(7);
variableNames.emitActionCb = '_' + Math.random().toString(36).substring(7);

function patchManifestCode(manifestCode) {
    var patchRules = [{
        name: "Exports exports scope",
        from: /var ([a-z])={},(.*?);/g,
        to: 'var $1={},$2;window["' + variableNames.exports + '"]=$1;'
    }];

    patchRules.forEach(function(item) {
        if (item.from.test(manifestCode)) {
            manifestCode = manifestCode.replace(item.from, item.to);
            console.log(item.name + " patched");
        } else {
            console.log("Err patching: " + item.name);
        }
    });

    return manifestCode;
}

function wrapAppCode(appCode) {
    /*
    	game: 		 		actual game state
    	exports: 			game constants and additional functions
    	interactionEmitter: object which you may interact
    	emitActionCb: 		calling when you may interact with interactionEmitter
    */

    var wrapCode = '';
    var modules = '';

    modules = '{';
    modules = modules + 'autoAim:';
    modules = modules + autoAim + ',';
    modules = modules + 'autoLoot:';
    modules = modules + autoLoot + ',';
    modules = modules + 'autoOpeningDoors:';
    modules = modules + autoOpeningDoors + ',';
    modules = modules + 'menu:';
    modules = modules + menu + ',';
    modules = modules + 'zoomRadiusManager:';
    modules = modules + zoomRadiusManager + '}';

    wrapCode = '(function(';
    wrapCode = wrapCode + variableNames.game + ',';
    wrapCode = wrapCode + variableNames.exports + ',';
    wrapCode = wrapCode + variableNames.interactionEmitter + ',';
    wrapCode = wrapCode + variableNames.emitActionCb + '){';

    appCode = wrapCode + appCode;

    wrapCode = '\n(' + init + ')(';
    wrapCode = wrapCode + variableNames.game + ',';
    wrapCode = wrapCode + variableNames.exports + ',';
    wrapCode = wrapCode + variableNames.interactionEmitter + ',';
    wrapCode = wrapCode + variableNames.emitActionCb + ',';
    wrapCode = wrapCode + modules + ');';
    wrapCode = wrapCode + '})({}, window["' + variableNames.exports + '"], {}, {});';

    appCode = appCode + wrapCode;

    return appCode;
}
RegExp.escape= function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};
function patchAppCode(appCode) {

    appCode = wrapAppCode(appCode);

    var patchRules = [{
            name: "Export game scope",
            from: /init:function\(\){var ([a-z]),([a-z])=this.pixi.renderer/,
            to: 'init:function(){' + variableNames.game + '.scope=this;var $1,$2=this.pixi.renderer'
        },
        {
            name: "Action emitter export",
            from: /([a-z])\.interaction\.text\=this\.getInteractionText\(([A-Za-z])\,([A-Za-z])\),/g,
            to: '$1.interaction.text=this.getInteractionText($2,$3),' + variableNames.interactionEmitter + '.scope=$3,'
        },
        {
            name: "Action emittion export",
            from: /([a-z]).interaction.text&&\(([a-z]).interaction.text.innerHTML=([a-z]).interaction.text\)/g,
            to: 'e.interaction.text&&(a.interaction.text.innerHTML=t.interaction.text,' + variableNames.emitActionCb + '.scope())'
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
            name: "Fix teams",
            from: new RegExp("([a-z])=\"app\\-\"\\+([a-z])\\.appIdToString\\(([a-z])\\.appId\\)\\+\"\\.\"\\+\\\/\\(\\[\\^\\\\\\.\\]\\+\\\\\\.\\[\\^\\\\\\.\\]\\+\\)\\$\\\/\\.exec\\(window\\.location\\.hostname\\)\\[0\\]", "g"),
            to: "$1=window.location.host"
        }
    ];

    patchRules.forEach(function(item) {
        if (item.from.test(appCode)) {
            console.log("Patched " + item.name)
            appCode = appCode.replace(item.from, item.to);
        } else {
            console.log("Err patching: " + item.name);
            console.log(item.from)
        }
    });

    return appCode;
}

var codeInjector = (function() {
    var _manifestCode = null;
    var _vendorCode = null;
    var _appCode = null;

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
            return onSuccess(patchedManifestCode);
        }
    }

    function updateVendorCode(url, onSuccess, onError) {
        console.log("Executing xhr vendor request...");
        console.log(url);
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.send();

        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return;
            if (this.status != 200) {
                return onError();
            }
            return onSuccess(xhr.responseText);
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
            return onSuccess(patchedAppCode);
        }
    }

    var setManifestCode = function(manifestCode) {
        _manifestCode = manifestCode;
        //console.log(_manifestCode)
    }

    var setVendorCode = function(vendorCode) {
        _vendorCode = vendorCode;
    }

    var setAppCode = function(appCode) {
        _appCode = appCode;
    }

    var injectCode = function(code) {
    	//console.log(code)
    	if (code){
    		injectedCode += code;
    	}
        /*chrome.tabs.get(tabId, function(tab) {
        	if(chrome.runtime.lastError) {
        		console.log(chrome.runtime.lastError.message.toString());
        		return;
        	} else {
        		chrome.tabs.executeScript(tabId, {
        			code: code
        		});
        	}
        });*/
    };

    var tryToInjectCode = function(tabId) {
    	injectedCode = "";
    	//console.log(_manifestCode)

        injectCode(_manifestCode);
        injectCode(_vendorCode);
        injectCode(_appCode);

        _manifestCode = _vendorCode = _appCode = null;
            //console.log("trytoinjectcode" + injectedCode.length)
            return;

    }

    return {
        updateManifestCode: updateManifestCode,
        updateVendorCode: updateVendorCode,
        updateAppCode: updateAppCode,
        setManifestCode: setManifestCode,
        setVendorCode: setVendorCode,
        setAppCode: setAppCode,
        tryToInjectCode: tryToInjectCode
    }
})();

var manifestCodeUpdating = false;
var vendorCodeUpdating = false;
var appCodeUpdating = false;

var listener =
    function(details, callback) {
        if (details.url.match(/manifest/)) {


            var manifestCode;


            codeInjector.updateManifestCode(details.url, function(patchedManifestCode) {
                //console.log("Manifest code updated." + patchedManifestCode);
                codeInjector.setManifestCode(patchedManifestCode);
                manifestCodeUpdating = false;
                codeInjector.tryToInjectCode(details.tabId);
                callback(injectedCode)
            }, function() {
                manifestCodeUpdating = false;
                console.log("Err getting manifest file. Page will be reloaded after 5 seconds...");

            });



        }

        if (details.url.match(/vendor/)) {


            var vendorCode;

            codeInjector.updateVendorCode(details.url, function(vendorCode) {
                console.log("Vendor code updated.");
                codeInjector.setVendorCode(vendorCode);
                vendorCodeUpdating = false;
                codeInjector.tryToInjectCode(details.tabId);
                callback(injectedCode)
            }, function() {
                vendorCodeUpdating = false;
                console.log("Err update vendor file. Page will be reloaded after 5 seconds...");
                setTimeout(function() { chrome.tabs.reload(details.tabId, null, null) }, 5000);
            });


        }

        if (details.url.match(/app/)) {



            var appCode;
            codeInjector.updateAppCode(details.url, function(patchedAppCode) {
                console.log("App code updated.");
                codeInjector.setAppCode(patchedAppCode);
                appCodeUpdating = false;
                codeInjector.tryToInjectCode(details.tabId);
                callback(injectedCode)
            }, function() {
                appCodeUpdating = false;
                console.log("Err update app file. Page will be reloaded after 5 seconds...");
                setTimeout(function() { chrome.tabs.reload(details.tabId, null, null) }, 5000);
            });


        }

        return {
            cancel: true
        }
    }
module.exports = function(){
	this.listener = listener;
	this.injectedCode = injectedCode;
}