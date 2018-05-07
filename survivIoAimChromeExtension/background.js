
chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		return {
			redirectUrl: chrome.runtime.getURL("js/app.0ca5c0d7.js")
		}
	},
	// filters
	{
		urls: [
			"*://*.surviv.io/js/app.0ca5c0d7.js",
		],
		types: ["script"]
	},
	// extraInfoSpec
	["blocking"]
);