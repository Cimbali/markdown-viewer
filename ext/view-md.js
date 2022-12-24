'use strict';

function parseURI() {
	let params = new URLSearchParams(window.location.search);
	let url = new URL(params.get("file"));
	if (url.protocol === 'ext+view-markdown:') {
		url = new URL(url.href.slice(url.protocol.length));
	}
	return Promise.resolve(url);
}

parseURI().then(fetch).then(r => {
	r.text().then(text => {
		renderDocument(document, text, document.body.appendChild, r.url)
	})
});
