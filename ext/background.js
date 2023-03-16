'use strict';

const webext = typeof browser === 'undefined' ? chrome : browser;

// Watch the updates of URLs we requested in the manifest
const urls = browser.runtime.getManifest().page_action.show_matches;

// The list (and order) of scripts to render a page with injection
const scripts = [
	"lib/markdown-it/dist/markdown-it.min.js",
	"lib/markdown-it-checkbox/dist/markdown-it-checkbox.min.js",
	"lib/markdown-it-emoji/dist/markdown-it-emoji.min.js",
	"lib/markdown-it-footnote/dist/markdown-it-footnote.min.js",
	"lib/markdown-it-fancy-lists/markdown-it-fancy-lists.js",
	"lib/highlightjs/build/highlight.min.js",
	"lib/katex/dist/katex.min.js",
	"lib/markdown-it-texmath/texmath.js",
	"ext/frontmatter.js",
	"ext/renderer.js",
	"ext/builder.js",
	"ext/inject.js"
];

const checks = [
	'document.body.childNodes.length === 1',
	'document.body.children.length === 1',
	'document.body.children[0].nodeName === "PRE"'
].join(' && ');

// Declare all event handlers at the top level
webext.browserAction.onClicked.addListener(() => {
	webext.tabs.create({ url: webext.runtime.getURL('/ext/view-md.html') });
});


async function renderTab(tabId, url, loadReplace) {
	const { inject_local: inject = false } = await webext.storage.sync.get('inject_local');

	if (url.protocol !== 'file:' || inject) {
		for (const path of scripts) {
			await webext.tabs.executeScript(tabId, { file: `/${path}` });
		}
		webext.pageAction.hide(tabId);
	} else {
		// Default for local files is to redirect to our page
		const dest = new URL(webext.runtime.getURL('/ext/view-md.html?file=') + encodeURIComponent(url));
		webext.tabs.update(tabId, {url: dest.href, loadReplace }).catch(console.error);
	}
}

async function tabUpdated(tabId, url) {
	try {
		const [isText] = await webext.tabs.executeScript(tabId, { code: checks });

		if (isText) {
			renderTab(tabId, url, true);
		}
	} catch (e) {
		// Host permissions are likely not enabled
		console.error(e);
		return;
	}
}

webext.pageAction.onClicked.addListener(tab => renderTab(tab.id, new URL(tab.url), false));

browser.tabs.onUpdated.addListener((tabId, { 'status': update }, { url = '' }) => {
	if (update === 'complete' && url) {
		tabUpdated(tabId, new URL(url));
	}
}, { urls, properties: ['status'] });


browser.runtime.onInstalled.addListener(({ reason, previousVersion }) => {
	const url = browser.runtime.getURL('/ext/onboarding.html');
	if (reason === 'update') {
		const prevMajor = parseInt(previousVersion.split('.')[0], 10);
		if (prevMajor === 1) {
			browser.tabs.create({ url: new URL(`?update=${previousVersion}`, url) });
		}
	}
	else if (reason === 'install') {
		browser.tabs.create({ url });
	}
});
