"use strict";

// Process only if document is unprocessed text.
const {body} = document;
if (body.childNodes.length === 1 &&
	body.children.length === 1 &&
	body.children[0].nodeName.toUpperCase() === 'PRE')
{
	let placerLambda = (renderedDOM) => {body.replaceChild(renderedDOM, body.firstChild);}
	
	webext.storage.sync.get({'embedding_mode': 'iframe'}).then((prefs) => {
		const emId = prefs['embedding_mode'];
		console.log("prefs", prefs);
		embeddingModes.get(emId)(window.location.href, body.firstChild.textContent, placerLambda);
	});
}
