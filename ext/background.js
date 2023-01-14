'use strict';

const webext = typeof browser === 'undefined' ? chrome : browser;

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

webext.browserAction.onClicked.addListener(() => {
	webext.tabs.create({ url: webext.runtime.getURL('/ext/view-md.html') });
});

webext.pageAction.onClicked.addListener(async (tab) => {
	const url = new URL(tab.url);
	const { redirect_local: redirect = false } = await webext.storage.sync.get('redirect_local');
	if (url.protocol === 'file:' && !redirect) {
		for (const path of scripts) {
			await webext.tabs.executeScript(tab.id, { file: `/${path}` });
		}
	} else {
		const dest = new URL(webext.runtime.getURL('/ext/view-md.html?file=') + encodeURIComponent(url));
		webext.tabs.update(tab.id, {url: dest.href}).catch(console.error);
	}
});
