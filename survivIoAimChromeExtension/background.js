
chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
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