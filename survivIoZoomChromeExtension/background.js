
chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		var xhr = new XMLHttpRequest();
		// xhr.open("GET", chrome.runtime.getURL("js/app.8c89d899.js"), false);
		// xhr.send();

		return {
			redirectUrl: chrome.runtime.getURL("js/app.8c89d899.js")
		}
	},
	// filters
	{
		urls: ["http://surviv.io/js/app.8c89d899.js"],
		types: ["script"]
	},
	// extraInfoSpec
	["blocking"]
);