'use strict';

importScripts('../lib/markdown-it/dist/markdown-it.min.js')
importScripts('../lib/markdown-it-checkbox/dist/markdown-it-checkbox.js')
importScripts('../lib/markdown-it-emoji/dist/markdown-it-emoji.js')
importScripts('../lib/markdown-it-footnote/dist/markdown-it-footnote.js')
importScripts('../lib/markdown-it-fancy-lists/markdown-it-fancy-lists.js')
importScripts('../lib/@highlightjs/cdn-assets/highlight.min.js')
importScripts('../srclib/katex/dist/katex.min.js')
importScripts('../lib/markdown-it-texmath/texmath.js')
importScripts('./frontmatter.js')
importScripts('./renderer.js')

onmessage = function(e) {
	const { text, plugins } = e.data;
	new Renderer(plugins).render(text).then(postMessage);
}
