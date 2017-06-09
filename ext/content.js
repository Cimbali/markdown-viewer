function addStylesheet(path, media) {
	var style = document.createElement('link');
	style.rel = 'stylesheet';
	if (media) { style.setAttribute('media', media); }
	style.type = 'text/css';
	style.href = browser.extension.getURL(path);
	document.head.appendChild(style);
}

function processMarkdown(textContent) {
	// Parse the content Markdown => HTML
	var md = markdownit({
		html: true,
		linkify: true,
		// Shameless copypasta https://github.com/markdown-it/markdown-it#syntax-highlighting
		highlight: function (str, lang) {
			if (lang && hljs.getLanguage(lang)) {
				try {
					return hljs.highlight(lang, str).value;
				} catch (__) {}
			}

			try {
				return hljs.highlightAuto(str).value;
			} catch (__) {}

			return ''; // use external default escaping
		}
	});

	var html = md.render(textContent);

	// Style the page and code highlights.
	addStylesheet('lib/sss/sss.css');
	addStylesheet('lib/sss/sss.print.css', 'print');
	addStylesheet('lib/highlightjs/styles/default.css');

	// This is considered a good practice for mobiles.
	var viewport = document.createElement('meta');
	viewport.name = 'viewport';
	viewport.content = 'width=device-width, initial-scale=1';
	document.head.appendChild(viewport);

	// Insert html for the markdown into an element for processing.
	var markdownRoot = document.createElement('div');
	markdownRoot.className = "markdownRoot";
	markdownRoot.innerHTML = html;

	// Trample out script elements.
	markdownRoot.querySelectorAll('script').forEach(each => {
		each.innerText = '';
		each.src = '';
	});
	// Remove hrefs that don't look like URLs.
	const likeUrl = /^[-a-z]*:\/\//i;
	markdownRoot.querySelectorAll('[href]').forEach(each => {
		if (!likeUrl.test(each.href)) {
			each.href = '';
		}
	});
	// Remove event handlers. (Others?)
	var events = ['onclick', 'onload', 'onmouseover', 'onmouseout'];
	var eventsJoined = '[' + events.join('],[') + ']';
	markdownRoot.querySelectorAll(eventsJoined).forEach(each => {
		events.forEach(attr => {
			if (each.getAttribute(attr)) { each.setAttribute(attr, null); }
		});
	});

	// Set the page title.
	var title = markdownRoot.querySelector('h1, h2, h3, h4, h5, h6');		// First header
	if (title) {
		title = title.textContent.trim();
	} else {
		title = markdownRoot.textContent.trim().split("\n", 1)[0].trim();	// First line
	}
	if (title.length > 50) {
		title = title.substr(0, 50) + "...";
	}
	document.title = title;

	// Finally insert the markdown.
	document.body.appendChild(markdownRoot);
}

function loadScriptThen(path, nextStep) {
	browser.runtime.sendMessage({ scriptToInject: path }, (response) => {
		if (response.success) { nextStep(); }
	});
}

// Execute only if .md is unprocessed text.
var body = document.body;
if (body.childNodes.length == 1 &&
	body.children.length == 1 &&
	body.children[0].nodeName.toUpperCase() == 'PRE')
{
	var textContent = body.textContent;
	body.textContent = '';

	loadScriptThen('lib/highlightjs/highlight.pack.min.js', () => {
		loadScriptThen('lib/markdown-it/dist/markdown-it.min.js', () => {
			processMarkdown(textContent);
		})
	});
}
