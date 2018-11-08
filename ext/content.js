const webext = typeof browser === 'undefined' ? chrome : browser;

function addStylesheet(href, media) {
	var style = document.createElement('link');
	style.rel = 'stylesheet';
	style.type = 'text/css';
	style.href = href;
	if (media) { style.setAttribute('media', media); }
	document.head.appendChild(style);
}
function addExtensionStylesheet(href, media) {
	addStylesheet(webext.extension.getURL(href), media);
}

function addCustomStylesheet() {
	webext.storage.sync.get('custom_css', (storage) => {
		if ('custom_css' in storage) {
			var style = document.createElement('style');
			style.textContent = storage.custom_css;
			document.head.appendChild(style);
		}
	});
}

function makeAnchor(node) {
	// From @tomfun https://gist.github.com/asabaylus/3071099#gistcomment-1622315
	var anchor = node.textContent.trim().toLowerCase().replace(/[^\w\- ]+/g, ' ').replace(/\s+/g, '-').replace(/\-+$/, '');

	if (typeof this.usedHeaders == 'undefined')
		this.usedHeaders = [];

	if (this.usedHeaders.indexOf(anchor) !== -1) {
		var i = 1;
		while (this.usedHeaders.indexOf(anchor + '-' + i) !== -1 && i <= 10)
			i++;
		anchor = anchor + '-' + i;
	}
	this.usedHeaders.push(anchor);
	node.id = anchor;
}

function processMarkdown(textContent) {
	// Parse the content Markdown => HTML
	var md = window.markdownit({
		html: true,
		linkify: true,
		// Shameless copypasta https://github.com/markdown-it/markdown-it#syntax-highlighting
		highlight: (str, lang) => {
			if (lang && window.hljs.getLanguage(lang)) {
				try {
					return window.hljs.highlight(lang, str).value;
				} catch (__) {}
			}

			try {
				return window.hljs.highlightAuto(str).value;
			} catch (__) {}
			return ''; // use external default escaping
		}
	})
	//markdown-it plugins:
	.use(window.markdownitCheckbox)
	.use(window.markdownitEmoji);

	var html = md.render(textContent);

	// Style the page and code highlights.
	addExtensionStylesheet('/lib/sss/sss.css');
	addExtensionStylesheet('/lib/sss/sss.print.css', 'print');
	addExtensionStylesheet('/lib/highlightjs/styles/default.css');
	// User-defined stylesheet.
	addCustomStylesheet();

	// This is considered a good practice for mobiles.
	var viewport = document.createElement('meta');
	viewport.name = 'viewport';
	viewport.content = 'width=device-width, initial-scale=1';
	document.head.appendChild(viewport);

	// Insert html for the markdown into an element for processing.
	var markdownRoot = document.createElement('div');
	markdownRoot.className = "markdownRoot";
	markdownRoot.innerHTML = html;

	var title = null;
	var headers = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
	const jsLink = /^\s*javascript:/i;
	var eachElement,
		allElements = document.createNodeIterator(markdownRoot, NodeFilter.SHOW_ELEMENT);
	while (eachElement = allElements.nextNode()) {
		var tagName = eachElement.tagName.toUpperCase();

		// Make anchor for headers; use first header text as page title.
		if (headers.includes(tagName)) {
			makeAnchor(eachElement);
			if (!title) { title = eachElement.textContent.trim(); }
		}
		// Crush scripts.
		if (tagName === 'SCRIPT') {
			eachElement.innerText = '';
			eachElement.src = '';
		}
		// Trample JavaScript hrefs.
		if (eachElement.getAttribute("href") && jsLink.test(eachElement.href)) {
			eachElement.setAttribute("href", "javascript:;");
		}
		// Remove event handlers.
		var eachAttributes = Array.from(eachElement.attributes);
		for (var j = 0; j < eachAttributes.length; j++) {
			var attr = eachAttributes[j];
			if (attr.name.toLowerCase().startsWith('on')) {
				eachElement.removeAttribute(attr.name);
			}
		}
	}

	// Set the page title.
	if (!title) {
		// Get first line if no header.
		title = markdownRoot.textContent.trim().split("\n", 1)[0].trim();
	}
	if (title.length > 128) {
		// Limit its length.
		title = title.substr(0, 125) + "...";
	}
	document.title = title;

	// Finally insert the markdown.
	document.body.appendChild(markdownRoot);
}

// Process only if document is unprocessed text.
var body = document.body;
if (body.childNodes.length === 1 &&
	body.children.length === 1 &&
	body.children[0].nodeName.toUpperCase() === 'PRE')
{
	var textContent = body.textContent;
	body.textContent = '';

	var url = window.location.href;
	var hash = url.lastIndexOf('#');
	if (hash > 0) url = url.substr(0, hash);	// Exclude fragment id from key.
	var scrollPosKey = encodeURIComponent(url) + ".scrollPosition";

	processMarkdown(textContent);
	try {
		window.scrollTo.apply(window, JSON.parse(sessionStorage[scrollPosKey] || '[0,0]'));
	} catch(err) {}

	window.addEventListener("unload", () => {
		sessionStorage[scrollPosKey] = JSON.stringify([window.scrollX, window.scrollY]);
	});
}
