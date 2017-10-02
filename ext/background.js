browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {

	const markdownFileExtension = /\.m(arkdown|kdn?|d(o?wn)?)(\?.*)?(#.*)?$/i;

	if (changeInfo.status === 'complete' && markdownFileExtension.test(tab.url)) {

		// Support loading additional scripts on demand by content script.
		browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
			if (message.scriptToInject) {
				browser.tabs.executeScript(sender.tab.id, { file: message.scriptToInject }, () => {
					sendResponse({ success: true });
				});
				return true;
			}
			return false;
		});

		browser.tabs.executeScript(id, { file: "ext/content.js" });
	}
});
