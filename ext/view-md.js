'use strict';

function parseURI() {
	const params = new URLSearchParams(window.location.search);
	try {
		const url = new URL(params.get("file"));
		if (url.protocol === 'ext+view-markdown:') {
			return new URL(url.href.slice(url.protocol.length));
		} else {
			return url;
		}
	} catch {
		return null;
	}
}

const file = parseURI();

function display(allowedUrl, displayUrl) {
	return fetch(allowedUrl).then(r => r.text()).then(text => {
		const inserter = rendered => document.body.appendChild(rendered);
		webext.storage.sync.get('iframe_embed').then(({ iframe_embed: embed = true }) => {
			if (embed) {
				renderInIframe(document, text, { inserter, url: allowedUrl.toString(), displayUrl });
			} else {
				renderInDocument(document, text, { inserter, url: allowedUrl.toString(), displayUrl });
			}
		})
	}).catch(() => {
		const error = document.body.appendChild(document.createElement('p'));
		error.classList.add('error');

		const span = error.appendChild(document.createElement('span'));
		span.innerText = 'Failed loading page ';

		const link = span.appendChild(document.createElement('a'));
		link.href = displayUrl;
		link.innerText = displayUrl;
	})
}

function stopEvent(e) {
	e.stopPropagation();
	e.preventDefault();
}

function accessGranted(e) {
	stopEvent(e);
	const [fileObj] = (e.target.tagName === 'INPUT' ? e.target : e.dataTransfer).files;

	let url, displayUrl;
	if (typeof fileObj !== 'undefined') {
		url = URL.createObjectURL(fileObj);
		displayUrl = file || `file:///C:/fakepath/${fileObj.name}`;
	}
	else if (e.dataTransfer) {
		// Someone dropped an URL here instead of a file
		try {
			url = new URL(e.dataTransfer.getData('text/plain'));
			displayUrl = url.toString()
		} catch {
			return
		}
	}

	const msg = document.body.querySelector('p.request-local-access');

	display(url, displayUrl).then(() => {
		document.body.removeChild(msg);
	});
}


if (file === null || file.protocol === 'file:') {
	const msg = document.body.appendChild(document.createElement('p'));
	msg.classList.add('request-local-access');

	if (file) {
		msg.appendChild(document.createTextNode(`The requested file is ${file}`));
		msg.appendChild(document.createElement('br'));
	}

	msg.appendChild(document.createTextNode(
		'For your security, Firefox requires you to select local markdown file explicitely '
		+ 'before markdown-viewer can open it.'
	));

	msg.addEventListener('dragenter', stopEvent, false);
	msg.addEventListener('dragover', stopEvent, false);
	msg.addEventListener('drop', accessGranted, false);

	msg.appendChild(document.createElement('br'));
	msg.appendChild(document.createElement('label')).appendChild(
		document.createTextNode('Select markdown file (or drag it onto this area): ')
	);

	const input = msg.lastChild.appendChild(document.createElement('input'));
	input.type = 'file';
	input.accept = 'text/markdown,text/plain,.md,.markdown,.mdown,.mdwn,.mkd,.mkdn';
	input.addEventListener('change', accessGranted, false);

	document.title = 'Markdown Viewer file selector';
} else {
	display(file, file)
}
