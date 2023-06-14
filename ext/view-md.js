'use strict';

function parseURI() {
	const params = new URLSearchParams(window.location.search);
	let file = params.get("file");
	if (!file) {
		return null;
	}
	if (file.startsWith('ext+view-markdown:')) {
		file = file.slice('ext+view-markdown:'.length);
	}

	try {
		const url = new URL(file);
		if (url.protocol) {
			return url;
		}
	} catch (e) {}

	// Try to handle URLs without schemes. Does it look like a local file path?
	if (file.startsWith('/') || file.match(/^[A-Z]:/u)) {
		try {
			return new URL(`file://${file}`);
		} catch (e) {}
	} else {
		try {
			return new URL(`http://${file}`);
		} catch (e) {}
	}

	return null;
}

const file = parseURI();

function display(allowedUrl, displayUrl) {
	const spinner = document.body.appendChild(document.createElement('div'));
	spinner.id = 'spinner';

	return fetch(allowedUrl).then(r => r.text()).then(text => {
		const inserter = rendered => document.body.replaceChild(rendered, spinner);
		webext.storage.sync.get(['iframe_embed', 'plugins']).then(({
			iframe_embed: embed = true,
			plugins = pluginDefaults,
		}) => {
			const { mermaid: useMermaid } = plugins;
			if (useMermaid) {
				mermaid.initialize();
			}
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

		document.body.removeChild(spinner);
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
		} catch (e) {
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
	msg.appendChild(document.createTextNode(
		'For your security, Firefox requires you to select local markdown file explicitely '
		+ 'before markdown-viewer can open it.'
	));
	msg.appendChild(document.createElement('br'));

	if (file) {
		msg.appendChild(document.createTextNode(`The requested file is `));
		const copy = msg.appendChild(document.createElement('span'));
		msg.appendChild(document.createElement('br'));

		copy.appendChild(document.createTextNode(file));
		copy.classList.add('copy');
		copy.title = 'Click to copy';

		const feedback = copy.appendChild(document.createElement('span'));
		feedback.classList.add('feedback');
		feedback.appendChild(document.createTextNode('Copied to clipboard!'));

		copy.addEventListener('click', () => {
			navigator.clipboard.writeText(file);
			feedback.style.display = 'block';
			setTimeout(() => { feedback.style.display = 'none'; }, 700)
		});
	}

	msg.addEventListener('dragenter', stopEvent, false);
	msg.addEventListener('dragover', stopEvent, false);
	msg.addEventListener('drop', accessGranted, false);

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
