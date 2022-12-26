'use strict';

const webext = typeof browser === 'undefined' ? chrome : browser;

webext.browserAction.onClicked.addListener(() => {
	webext.tabs.create({ url: webext.runtime.getURL('/ext/view-md.html') });
});

webext.pageAction.onClicked.addListener((tab) => {
	const dest = new URL(webext.runtime.getURL('/ext/view-md.html?file=') + encodeURIComponent(tab.url));
	webext.tabs.update(tab.id, {url: dest.href}).catch(console.error);
});
