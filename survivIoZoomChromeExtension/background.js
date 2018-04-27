
chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		var xhr = new XMLHttpRequest();
		// xhr.open("GET", chrome.runtime.getURL("js/app.b619a0d4.js"), false);
		// xhr.send();

		return {
			redirectUrl: chrome.runtime.getURL("js/app.b619a0d4.js")
		}
	},
	// filters
	{
		urls: ["http://surviv.io/js/app.b619a0d4.js"],
		types: ["script"]
	},
	// extraInfoSpec
	["blocking"]
);