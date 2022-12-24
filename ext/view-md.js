'use strict';

function parseURI() {
	let params = new URLSearchParams(window.location.search);
	let url = new URL(params.get("file"));
	if (url.protocol === 'ext+view-markdown:') {
		return new URL(url.href.slice(url.protocol.length));
	} else {
		return url;
	}
}

const file = parseURI();

fetch(file.href).then(r => r.text()).then(text => {
	renderDocument(document, text, rendered => document.body.appendChild(rendered), file.href);
}).catch(err => {
	const error = document.body.appendChild(document.createElement('p'));
	error.classList.add('error');

	const span = error.appendChild(document.createElement('span'));
	span.innerText = 'Failed loading page ';

	if (file.protocol === 'file:') {
		// We’re not even allowed to link to the file
		span.innerText += ` ${file.href}`;

		error.appendChild(document.createElement('br'));
		error.appendChild(document.createTextNode('Unfortunately, file:// URLs can not be opened via the an extension page.'));
	} else {
		const link = span.appendChild(document.createElement('a'));
		link.href = file.href;
		link.innerText = file.href;
	}
});
