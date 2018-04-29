
chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		var xhr = new XMLHttpRequest();
		// xhr.open("GET", chrome.runtime.getURL("js/app.8f05fe0e.js"), false);
		// xhr.send();

		return {
			redirectUrl: chrome.runtime.getURL("js/app.8f05fe0e.js")
		}
	},
	// filters
	{
		urls: ["http://surviv.io/js/app.8f05fe0e.js"],
		types: ["script"]
	},
	// extraInfoSpec
	["blocking"]
);