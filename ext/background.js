'use strict';

const webext = typeof browser === 'undefined' ? chrome : browser;

webext.runtime.onMessage.addListener((msg, sender) => {
	if (msg === 'content script running') {
		webext.pageAction.hide(sender.tab.id);
	}
});

webext.pageAction.onClicked.addListener((tab) => {
	const dest = new URL(webext.runtime.getURL('/ext/view-md.html?file=') + encodeURIComponent(tab.url));
	webext.tabs.update(tab.id, {url: dest.href}).then(tab => webext.pageAction.hide(tab.id)).catch(console.error);
});
