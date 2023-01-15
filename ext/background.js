'use strict';

const webext = typeof browser === 'undefined' ? chrome : browser;

// Watch the updates of URLs we requested in the manifest
const { permissions } = browser.runtime.getManifest();
const urls = permissions.filter(perm => perm.includes('://'));

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

function redirect(tabId, url) {
	const dest = new URL(webext.runtime.getURL('/ext/view-md.html?file=') + encodeURIComponent(url));
	webext.tabs.update(tabId, {url: dest.href}).catch(console.error);
}

async function tabUpdated(tabId, url, fallback=false) {
	try {
		const [isText] = await webext.tabs.executeScript(tabId, { code: checks });

		if (!isText) {
			return;
		}
	} catch (e) {
		// Host permissions are likely not enabled
		console.error(e);
		if (fallback) {
			redirect(tabId, url);
		}
		return;
	}

	const { inject_local: inject = true } = await webext.storage.sync.get('inject_local');
	if (url.protocol === 'file:' && inject) {
		for (const path of scripts) {
			await webext.tabs.executeScript(tabId, { file: `/${path}` });
		}
		webext.pageAction.hide(tabId);
	} else {
		// Default is to redirect to our page
		redirect(tabId, url);
	}
}

webext.pageAction.onClicked.addListener(tab => tabUpdated(tab.id, new URL(tab.url), true));

browser.tabs.onUpdated.addListener((tabId, { 'status': update }, { url }) => {
	if (update === 'complete') {
		tabUpdated(tabId, new URL(url));
	}
}, { urls, properties: ['status'] });
