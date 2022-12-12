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
	renderDocument(document, body.firstChild.textContent, { inserter, url: window.location.href })
}

webext.runtime.sendMessage('content script running');
