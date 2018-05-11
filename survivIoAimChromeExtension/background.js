
chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		return {
			redirectUrl: chrome.runtime.getURL("js/app.50e874a3.js")
		}
	},
	// filters
	{
		urls: [
			"*://*.surviv.io/js/app.50e874a3.js",
		],
		types: ["script"]
	},
	// extraInfoSpec
	["blocking"]
);