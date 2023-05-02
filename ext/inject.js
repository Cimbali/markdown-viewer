'use strict';

// NB. webext defined in builder.js
//const webext = typeof browser === 'undefined' ? chrome : browser;

// Process only if document is unprocessed text.
const {body} = document;
if (body.childNodes.length === 1 &&
	body.children.length === 1 &&
	body.children[0].nodeName.toUpperCase() === 'PRE')
{
	const inserter = renderedDOM => body.replaceChild(renderedDOM, body.firstChild);
	webext.storage.sync.get(['iframe_embed', 'plugins']).then(({ iframe_embed: embed = true, plugins }) => {
		const { mermaid: useMermaid = pluginDefaults.mermaid } = plugins;
		if (useMermaid) {
			mermaid.initialize();
		}
		if (embed) {
			renderInIframe(document, body.firstChild.textContent, { inserter, url: window.location.href });
			addExtensionStylesheet(document, '/ext/view-md.css', {});
		} else {
			renderInDocument(document, body.firstChild.textContent, { inserter, url: window.location.href })
		}
	});
}
