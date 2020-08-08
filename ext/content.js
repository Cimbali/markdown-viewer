'use strict';

const webext = typeof browser === 'undefined' ? chrome : browser;
const headerTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
const pluginDefaults = {'hljs': true, 'checkbox': true, 'emojis': true, 'footnotes': false, 'fancy-lists': false};

const mdcss = {'default': 'sss', 'github': 'github'}
const hlcss = ['a11y-dark', 'a11y-light', 'agate', 'androidstudio', 'an-old-hope', 'arduino-light', 'arta', 'ascetic',
	'atelier-cave-dark', 'atelier-cave-light', 'atelier-dune-dark', 'atelier-dune-light', 'atelier-estuary-dark',
	'atelier-estuary-light', 'atelier-forest-dark', 'atelier-forest-light', 'atelier-heath-dark', 'atelier-heath-light',
	'atelier-lakeside-dark', 'atelier-lakeside-light', 'atelier-plateau-dark', 'atelier-plateau-light',
	'atelier-savanna-dark', 'atelier-savanna-light', 'atelier-seaside-dark', 'atelier-seaside-light',
	'atelier-sulphurpool-dark', 'atelier-sulphurpool-light', 'atom-one-dark', 'atom-one-dark-reasonable',
	'atom-one-light', 'brown-paper', 'brown-papersq', 'codepen-embed', 'color-brewer', 'darcula', 'dark', 'default',
	'docco', 'dracula', 'far', 'foundation', 'github', 'github-gist', 'gml', 'googlecode', 'gradient-dark', 'grayscale',
	'gruvbox-dark', 'gruvbox-light', 'hopscotch', 'hybrid', 'idea', 'ir-black', 'isbl-editor-dark', 'isbl-editor-light',
	'kimbie', 'kimbie', 'lightfair', 'lioshi', 'magula', 'monokai', 'monokai-sublime', 'mono-blue', 'night-owl', 'nnfx',
	'nnfx-dark', 'nord', 'obsidian', 'ocean', 'paraiso-dark', 'paraiso-light', 'pojoaque', 'pojoaque', 'purebasic',
	'qtcreator_dark', 'qtcreator_light', 'railscasts', 'rainbow', 'routeros', 'school-book', 'school-book',
	'shades-of-purple', 'solarized-dark', 'solarized-light', 'srcery', 'sunburst', 'tomorrow', 'tomorrow-night', 'vs',
	'tomorrow-night-blue', 'tomorrow-night-bright', 'tomorrow-night-eighties', 'vs2015', 'xcode', 'xt256', 'zenburn',
]

function addStylesheet(data) {
	const style = document.createElement('style');
	style.textContent = data;
	return document.head.appendChild(style);
}

function addExtensionStylesheet(href, attributes, existingStyleElement) {
	return fetch(webext.extension.getURL(href)).then(response => response.text()).then(data => {
		const sheet = existingStyleElement || addStylesheet(data);
		if (existingStyleElement) {
			sheet.textContent = data;
		}
		for (const [attr, val] of Object.entries(attributes || {})) {
			sheet.setAttribute(attr, val);
		}
		return sheet;
	})
}

function addCustomStylesheet() {
	const p = webext.storage.sync.get({'custom_css': ''})
	return p.then(({custom_css: data}) => {
		return addStylesheet(data);
	});
}

function makeAnchor(node) {
	// From @ChenYingChou https://gist.github.com/asabaylus/3071099#gistcomment-1479328
	let anchor = node.textContent.trim().toLowerCase().
		// single chars that are removed
		replace(/[`~!@#$%^&*()+=<>?,./:;"'|{}[\]\\–—]/gu, ''). // `
		// CJK punctuations that are removed
		replace(/[　。？！，、；：“”【】（）〔〕［］﹃﹄“”‘’﹁﹂—…－～《》〈〉「」]/gu, '').
		replace(/\s+/gu, '-').replace(/-+$/u, '');

	if (typeof makeAnchor.usedHeaders === 'undefined')
		{makeAnchor.usedHeaders = [];}

	if (makeAnchor.usedHeaders.indexOf(anchor) !== -1) {
		let i = 1;
		while (makeAnchor.usedHeaders.indexOf(`${anchor  }-${  i}`) !== -1 && i <= 10)
			{i++;}
		anchor = `${anchor  }-${  i}`;
	}
	makeAnchor.usedHeaders.push(anchor);
	node.id = anchor;
}

async function createHTMLSourceBlob() {
	const a = document.getElementById('__markdown-viewer__download');

	/* create a string containing the html headers, but inline all the <link rel="stylesheet" /> tags */
	let headerContent = '';
	for (let i = 0, t = document.head.children[i]; i < document.head.children.length; t = document.head.children[++i]) {
		if (t.tagName === 'LINK' && t.hasAttribute('rel') && t.getAttribute('rel').includes('stylesheet')) {
			if (!t.hasAttribute('href') || new URL(t.href).protocol === 'resource:') {
				continue;
			}

			/* async + await so stylesheets get processed in order, and to know when we finished parsing them all */
			let res, css;
			try {
				res = await window.fetch(t.href);
				css = await res.text();
			} catch (e) {
				continue;
			}
			const style = document.createElement('style');
			if (t.hasAttribute('media')) {
				style.setAttribute('media', t.getAttribute('media'));
			}
			style.textContent = css;
			headerContent += style.outerHTML;
		}
		else {
			headerContent += t.outerHTML;
		}
	}

	/* the body is copied as-is */
	const html = `<html><head>${headerContent}</head><body>${document.body.innerHTML}</body></html>`;
	a.href = URL.createObjectURL(new Blob([html], {type: "text/html"}));

	/* once we're done display the download button, so it does not appear in the downlaoded html */
	a.style.display = 'inline-block';
}

function highlightCodeBlock(str, lang)
{
	// Shameless copypasta https://github.com/markdown-it/markdown-it#syntax-highlighting
	if (lang && hljs.getLanguage(lang)) {
		try {
			return hljs.highlight(lang, str).value;
		} catch (e) {}
	}

	try {
		return hljs.highlightAuto(str).value;
	} catch (e) {}
	return ''; // use external default escaping
}

async function processMarkdown(textContent, plugins) {
	// Parse the content Markdown => HTML
	const md = window.markdownit({
		html: true,
		linkify: true,
		...plugins.hljs ? {highlight: highlightCodeBlock} : {},
	})
	//markdown-it plugins:
	if (plugins.checkbox) {md.use(window.markdownitCheckbox);}
	if (plugins.emojis) {md.use(window.markdownitEmoji);}
	if (plugins.footnotes) {md.use(window.markdownitFootnote);}
	if (plugins['fancy-lists']) {
		md.block.ruler.at('list', fancyList, { alt: [ 'paragraph', 'reference', 'blockquote' ] });
	}

	const html = md.render(textContent);

	const styleSheetsDone = Promise.all([
		// Style the page and code highlights.
		addExtensionStylesheet('/lib/sss/sss.css', {class: '__markdown-viewer__md_css'}),
		addExtensionStylesheet('/lib/sss/sss.print.css', {media: 'print', class: '__markdown-viewer__md_css'}),
		addExtensionStylesheet('/lib/highlightjs/build/styles/default.min.css', {id: '__markdown-viewer__hljs_css'}),
		addExtensionStylesheet('/ext/menu.css'),
		// User-defined stylesheet.
		addCustomStylesheet(),
	])

	// This is considered a good practice for mobiles.
	const viewport = document.createElement('meta');
	viewport.name = 'viewport';
	viewport.content = 'width=device-width, initial-scale=1';
	document.head.appendChild(viewport);

	// Insert html for the markdown into an element for processing.
	const markdownRoot = document.createElement('div');
	markdownRoot.className = "markdownRoot";
	markdownRoot.innerHTML = html;

	let title = null;
	const jsLink = /^\s*javascript:/iu;
	const allElements = document.createNodeIterator(markdownRoot, NodeFilter.SHOW_ELEMENT);
	let eachElement;
	while ((eachElement = allElements.nextNode())) {
		const tagName = eachElement.tagName.toUpperCase();

		// Make anchor for headers; use first header text as page title.
		if (headerTags.includes(tagName)) {
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
			eachElement.setAttribute("href", "");
		}
		// Remove event handlers.
		const eachAttributes = Array.from(eachElement.attributes);
		for (let j = 0; j < eachAttributes.length; j++) {
			const attr = eachAttributes[j];
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
		title = `${title.substr(0, 125)  }...`;
	}
	document.title = title;

	// Finally insert the markdown.
	document.body.appendChild(markdownRoot);

	return await styleSheetsDone;
}

function buildStyleOptions() {
	const p = document.createElement('p');
	p.appendChild(document.createTextNode('Pick a markdown and code style:'));
	p.appendChild(document.createElement('br'));
	p.className = 'toggleable';

	const mdselect = p.appendChild(document.createElement('select'));
	mdselect.id = '__markdown-viewer__mdselect';
	for (const val of Object.keys(mdcss)) {
		const opt = mdselect.appendChild(document.createElement('option'));
		opt.textContent = val;
		opt.value = mdcss[val];
		opt.selected = opt.value === 'sss';
	}

	mdselect.onchange = () => {
		const mdchosen = mdselect.value;

		for (const css of document.getElementsByClassName('__markdown-viewer__md_css')) {
			const suffix = css.hasAttribute('media') ? `.${css.getAttribute('media')}` : '';
			addExtensionStylesheet(`/lib/sss/${mdchosen}${suffix}.css`, {}, css);
		}
		webext.storage.sync.set({ chosen_md_style: mdselect.value });
	}

	const hlselect = p.appendChild(document.createElement('select'));
	hlselect.id = '__markdown-viewer__hlselect';
	for (const hlopt of hlcss) {
		const opt = hlselect.appendChild(document.createElement('option'));
		opt.value = opt.textContent = hlopt;
		opt.selected = hlopt === 'default';
	}

	hlselect.onchange = () => {
		addExtensionStylesheet(`/lib/highlightjs/build/styles/${hlselect.value}.min.css`, {},
								document.getElementById('__markdown-viewer__hljs_css'));
		webext.storage.sync.set({chosen_hl_style: hlselect.value});
	}

	return webext.storage.sync.get(['chosen_md_style', 'chosen_hl_style']).then((storage) => {
		if ('chosen_md_style' in storage && mdselect.value !== storage.chosen_md_style) {
			mdselect.value = storage.chosen_md_style;
			mdselect.dispatchEvent(new Event('change'));
		}

		if ('chosen_hl_style' in storage && hlselect.value !== storage.chosen_hl_style) {
			hlselect.value = storage.chosen_hl_style;
			hlselect.dispatchEvent(new Event('change'));
		}

       return p;
	});
}

function buildDownloadButton() {
	const a = document.createElement('p').appendChild(document.createElement('a'));
	a.parentNode.className = 'toggleable'
	a.id = '__markdown-viewer__download';
	a.download = 'markdown.html';
	a.innerText = 'Download as HTML';
	a.style.display = 'none';

	return Promise.resolve(a.parentNode);
}

function buildTableOfContents() {
	// build a table of contents if there are any headers
	const allHeaders = Array.from(document.querySelectorAll(headerTags.join(',')));
	if (allHeaders.length) {
		// list uniquely the used header titles, so we only consider those for nesting
		const usedHeaderTags = allHeaders.map(header => header.tagName).filter((level, index, self) =>
			self.indexOf(level) === index
		).sort();

		const tocdiv = document.createElement('div');
		let level = 0, list = tocdiv.appendChild(document.createElement('ul'));
		for (const header of allHeaders) {
			/* Open/close the right amount of nested lists to fit tag level */
			const headerLevel = usedHeaderTags.indexOf(header.tagName);
			for (; level < headerLevel; level++) {
				if (list.lastChild === null || list.lastChild.tagName !== 'LI')
					{list.appendChild(document.createElement('li'))}
				list = list.lastChild.appendChild(document.createElement('ul'));
			}
			for (; level > headerLevel; level--) {
				list = list.parentNode.parentNode;
			}

			/* Make a list item with a link to the heading */
			const link = document.createElement('a');
			link.textContent = header.textContent;
			link.href = `#${  header.id}`;
			list.appendChild(document.createElement('li')).appendChild(link);
		}

		tocdiv.id = '__markdown-viewer__toc';
		tocdiv.className = 'toggleable'
		return Promise.resolve(tocdiv);
	}
	else
		{return Promise.resolve(null);}
}

function addMarkdownViewerMenu() {
	const toolsdiv = document.createElement('div');
	toolsdiv.id = '__markdown-viewer__tools';
	toolsdiv.className = 'hidden';
	const getMenuDisplayDone = webext.storage.sync.get('display_menu').then(storage => {
		toolsdiv.className = 'display_menu' in storage ? storage.display_menu : 'floating';
	});

	const input = toolsdiv.appendChild(document.createElement('input'));
	const label = toolsdiv.appendChild(document.createElement('label'));
	input.type = 'checkbox';
	input.id = '__markdown-viewer__show-tools';
	label.setAttribute('for', input.id);

	const p = Promise.all([getMenuDisplayDone, buildTableOfContents(), buildStyleOptions(), buildDownloadButton()]);
	p.then(([, ...nodes]) => {
		nodes.filter(node => node).forEach(node => toolsdiv.appendChild(node));
		document.body.prepend(toolsdiv);
	});
	return p;
}

// Process only if document is unprocessed text.
const {body} = document;
if (body.childNodes.length === 1 &&
	body.children.length === 1 &&
	body.children[0].nodeName.toUpperCase() === 'PRE')
{
	const {textContent} = body;
	body.textContent = '';

	let url = window.location.href;
	const hash = url.lastIndexOf('#');
	if (hash > 0) {url = url.substr(0, hash);}	// Exclude fragment id from key.
	const scrollPosKey = `${encodeURIComponent(url)}.scrollPosition`;

	webext.storage.sync.get('plugins').then(storage => Object.assign(pluginDefaults, storage.plugins)).
		then(pluginPrefs => processMarkdown(textContent, pluginPrefs)).
		then(() => addMarkdownViewerMenu()).
		then(() => createHTMLSourceBlob());

	try {
		window.scrollTo(...JSON.parse(sessionStorage[scrollPosKey] || '[0,0]'));
	} catch(err) {}

	window.addEventListener("unload", () => {
		sessionStorage[scrollPosKey] = JSON.stringify([window.scrollX, window.scrollY]);
	});
}
