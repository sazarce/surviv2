
chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		return {
			redirectUrl: chrome.runtime.getURL("js/app.b9dc574e.js")
		}
	},
	// filters
	{
		urls: [
			"*://*.surviv.io/js/app.b9dc574e.js",
		],
		types: ["script"]
	},
	// extraInfoSpec
	["blocking"]
);