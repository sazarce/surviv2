
chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		var xhr = new XMLHttpRequest();
		// xhr.open("GET", chrome.runtime.getURL("js/app.57df691c.js"), false);
		// xhr.send();

		return {
			redirectUrl: chrome.runtime.getURL("js/app.57df691c.js")
		}
	},
	// filters
	{
		urls: ["http://surviv.io/js/app.57df691c.js"],
		types: ["script"]
	},
	// extraInfoSpec
	["blocking"]
);