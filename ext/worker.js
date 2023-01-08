'use strict';

importScripts('../lib/markdown-it/dist/markdown-it.min.js')
importScripts('../lib/markdown-it/dist/markdown-it.min.js')
importScripts('../lib/markdown-it-checkbox/dist/markdown-it-checkbox.min.js')
importScripts('../lib/markdown-it-emoji/dist/markdown-it-emoji.min.js')
importScripts('../lib/markdown-it-footnote/dist/markdown-it-footnote.min.js')
importScripts('../lib/markdown-it-fancy-lists/markdown-it-fancy-lists.js')
importScripts('../lib/highlightjs/build/highlight.min.js')
importScripts('../lib/katex/dist/katex.min.js')
importScripts('../lib/markdown-it-texmath/texmath.js')
importScripts('./frontmatter.js')
importScripts('./renderer.js')

onmessage = function(e) {
	const { text, plugins } = e.data;
	new Renderer(plugins).render(text).then(postMessage);
}
