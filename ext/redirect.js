'use strict';

const webext = typeof browser === 'undefined' ? chrome : browser;

// Trigger only if document is unprocessed text.
const {body} = document;
if (body.childNodes.length === 1 &&
	body.children.length === 1 &&
	body.children[0].nodeName.toUpperCase() === 'PRE')
{
	window.location = new URL(
		webext.runtime.getURL('/ext/view-md.html?file=')
		+ encodeURIComponent(window.location.href)
	);
}
