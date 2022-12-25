'use strict';

const webext = typeof browser === 'undefined' ? chrome : browser;
const headerTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
const pluginDefaults = {'hljs': true, 'checkbox': true, 'emojis': true, 'footnotes': false, 'fancy-lists': false,
						'texmath': false};

const mdcss = {'default': 'sss', 'github': 'github'}
const hlcss = [
	'a11y-dark', 'a11y-light', 'a11y-auto', 'agate', 'androidstudio', 'an-old-hope', 'arduino-light', 'arta', 'ascetic',
	'atelier-cave-dark', 'atelier-cave-light', 'atelier-cave-auto', 'atelier-dune-dark', 'atelier-dune-light',
	'atelier-dune-auto', 'atelier-estuary-dark', 'atelier-estuary-light', 'atelier-estuary-auto', 'atelier-forest-dark',
	'atelier-forest-light', 'atelier-forest-auto', 'atelier-heath-dark', 'atelier-heath-light', 'atelier-heath-auto',
	'atelier-lakeside-dark', 'atelier-lakeside-light', 'atelier-lakeside-auto', 'atelier-plateau-dark',
	'atelier-plateau-light', 'atelier-plateau-auto', 'atelier-savanna-dark', 'atelier-savanna-light',
	'atelier-savanna-auto', 'atelier-seaside-dark', 'atelier-seaside-light', 'atelier-seaside-auto',
	'atelier-sulphurpool-dark', 'atelier-sulphurpool-light', 'atelier-sulphurpool-auto', 'atom-one-dark',
	'atom-one-dark-reasonable', 'atom-one-light', 'brown-paper', 'codepen-embed', 'color-brewer', 'darcula', 'dark',
	'default', 'docco', 'dracula', 'far', 'foundation', 'github', 'github-gist', 'gml', 'googlecode', 'gradient-dark',
	'grayscale', 'gruvbox-dark', 'gruvbox-light', 'gruvbox-auto', 'hopscotch', 'hybrid', 'idea', 'ir-black',
	'isbl-editor-dark', 'isbl-editor-light', 'isbl-editor-auto', 'kimbie', 'kimbie', 'lightfair', 'lioshi', 'magula',
	'mono-blue', 'monokai', 'monokai-sublime', 'night-owl', 'nnfx', 'nnfx-dark', 'nord', 'obsidian', 'ocean',
	'paraiso-dark', 'paraiso-light', 'paraiso-auto', 'pojoaque', 'purebasic', 'qtcreator_dark', 'qtcreator_light',
	'qtcreator_auto', 'railscasts', 'rainbow', 'routeros', 'school-book', 'shades-of-purple', 'solarized-dark',
	'solarized-light', 'solarized-auto', 'srcery', 'sunburst', 'tomorrow', 'tomorrow-night', 'tomorrow-night-blue',
	'tomorrow-night-bright', 'tomorrow-night-eighties', 'vs', 'vs2015', 'xcode', 'xt256', 'zenburn',
]

function addStylesheet(doc, attributes) {
	const style = doc.createElement('style');
	for (const [attr, val] of Object.entries(attributes || {})) {
		style.setAttribute(attr, val);
	}
	doc.head.appendChild(style);
	return style
}

function setExtensionStylesheet(href, sheet) {
	return fetch(webext.extension.getURL(href)).then(response => response.text()).then(data => {
		sheet.textContent = data;
		return sheet;
	}).catch(() => console.error(`Failed fetching or setting stylesheet ${href}`))
}

function setExtensionStylesheetAuto(hrefDark, hrefLight, sheet) {
	return Promise.all([
		fetch(webext.extension.getURL(hrefDark)).then(response => response.text()),
		fetch(webext.extension.getURL(hrefLight)).then(response => response.text()),
	]).then(([dataDark, dataLight]) => {
		sheet.textContent = `
@media (prefers-color-scheme: light) { ${dataLight} }

@media (prefers-color-scheme: dark) { ${dataDark} }`;
		return sheet;
	}).catch(() => console.error(`Failed fetching or setting hljs stylesheet(s) ${hrefDark} and/or ${hrefLight}`))
}

function setCustomStylesheet(sheet) {
	return webext.storage.sync.get({'custom_css': ''}).then(({custom_css: data}) => {
		sheet.textContent = data;
	});
}

function makeAnchor(node, usedHeaders) {
	// From @ChenYingChou https://gist.github.com/asabaylus/3071099#gistcomment-1479328
	let anchor = node.textContent.trim().toLowerCase()
		// single chars that are removed
		.replace(/[`~!@#$%^&*()+=<>?,./:;"'|{}[\]\\–—]/gu, '') // `
		// CJK punctuations that are removed
		.replace(/[　。？！，、；：“”【】（）〔〕［］﹃﹄“”‘’﹁﹂—…－～《》〈〉「」]/gu, '')
		.replace(/\s+/gu, '-').replace(/-+$/u, '');

	if (usedHeaders.indexOf(anchor) !== -1) {
		let i = 1;
		for (; i <= 10; i++) {
			if (usedHeaders.indexOf(`${anchor}-${i}`) === -1) {
				break;
			}
		}
		anchor = `${anchor}-${i}`;
	}

	return anchor;
}

function createHTMLSourceBlob(doc) {
	const a = doc.getElementById('__markdown-viewer__download');
	if (a === null) {
		return
	}

	if (a.href) {
		URL.releaseObjectURL(a.href);
	}

	// Hide the download button, so it does not appear in the downloaded html.
	a.style.display = 'none';

	const html = `<html>${doc.head.outerHTML}${doc.body.outerHTML}</html>`;
	a.href = URL.createObjectURL(new Blob([html], {type: "text/html"}));

	a.style.display = 'inline-block';
}

function makeDocHeader(doc, markdownRoot, title) {
	const styleSheetsDone = Promise.all([
		// Style the page and code highlights.
		setExtensionStylesheet('/lib/sss/sss.css',
							   addStylesheet(doc, {media: 'screen', id: '__markdown-viewer__md_css'})),
		setExtensionStylesheet('/lib/sss/print.css',
							   addStylesheet(doc, {media: 'print', id: '__markdown-viewer__md_print_css'})),
		setExtensionStylesheet('/lib/highlightjs/build/styles/default.min.css',
							   addStylesheet(doc, {id: '__markdown-viewer__hljs_css'})),
		setExtensionStylesheet('/lib/katex/dist/katex.min.css',
							   addStylesheet(doc, {id: '__markdown-viewer__katex_css'})),
		setExtensionStylesheet('/lib/markdown-it-texmath/css/texmath.css',
							   addStylesheet(doc, {id: '__markdown-viewer__texmath_css'})),
		setExtensionStylesheet('/ext/menu.css', addStylesheet(doc, {id: '__markdown-viewer__menu_css'})),
		// User-defined stylesheet.
		setCustomStylesheet(addStylesheet(doc, {id: '__markdown-viewer__custom_css'})),
	])

	// This is considered a good practice for mobiles.
	const viewport = doc.createElement('meta');
	viewport.name = 'viewport';
	viewport.content = 'width=device-width, initial-scale=1';
	doc.head.appendChild(viewport);

	// Set the page title.
	if (!title) {
		// Get first line if no header.
		title = markdownRoot.textContent.trim().split("\n", 1)[0].trim();
	}
	if (title.length > 128) {
		// Limit its length.
		title = `${title.substr(0, 125)  }...`;
	}

	doc.title = title;

	return styleSheetsDone;
}

function processRenderedMarkdown(html) {
	// Parse the element’s content Markdown to HTML, inside a div.markdownRoot
	const doc = new DOMParser().parseFromString(`<div class="markdownRoot">${html}</div>`, "text/html");
	const markdownRoot = doc.body.removeChild(doc.body.firstChild);

	// Perform some cleanup and extract headers
	let title = null;
	const documentAnchors = [];
	const jsLink = /^\s*javascript:/iu;
	const allElements = doc.createNodeIterator(markdownRoot, NodeFilter.SHOW_ELEMENT);
	let eachElement;
	while ((eachElement = allElements.nextNode())) {
		const tagName = eachElement.tagName.toUpperCase();

		// Make anchor for headers; use first header text as page title.
		if (headerTags.includes(tagName)) {
			const anchor = makeAnchor(eachElement, documentAnchors);
			documentAnchors.push(eachElement.id = anchor);
			if (!title) { title = eachElement.textContent.trim(); }
		}
		// Crush scripts.
		if (tagName === 'SCRIPT') {
			eachElement.remove();
		}
		// Trample JavaScript hrefs.
		if (eachElement.getAttribute("href") && jsLink.test(eachElement.href)) {
			eachElement.removeAttribute("href");
		}
		// Remove event handlers.
		for (const attr of eachElement.attributes) {
			if (attr.name.toLowerCase().startsWith('on')) {
				eachElement.removeAttribute(attr.name);
			}
		}
	}

	return { DOM: markdownRoot, title };
}

function buildStyleOptions(doc) {
	const p = doc.createElement('p');
	p.appendChild(doc.createTextNode('Pick a markdown and code style:'));
	p.appendChild(doc.createElement('br'));
	p.className = 'toggleable';

	const mdselect = p.appendChild(doc.createElement('select'));
	mdselect.id = '__markdown-viewer__mdselect';
	for (const [key, val] of Object.entries(mdcss)) {
		const opt = mdselect.appendChild(doc.createElement('option'));
		opt.textContent = key;
		opt.value = val;
		opt.selected = key === 'default';
	}

	mdselect.addEventListener('change', () => {
		const mdchosen = mdselect.value;

		setExtensionStylesheet(`/lib/sss/${mdchosen}.css`,
								doc.getElementById('__markdown-viewer__md_css'));

		webext.storage.sync.set({ chosen_md_style: mdselect.value });
		createHTMLSourceBlob(doc);
	})

	const hlselect = p.appendChild(doc.createElement('select'));
	hlselect.id = '__markdown-viewer__hlselect';
	for (const hlopt of hlcss) {
		const opt = hlselect.appendChild(doc.createElement('option'));
		opt.value = opt.textContent = hlopt;
		opt.selected = hlopt === 'default';
	}

	hlselect.addEventListener('change', () => {
		const sheet = doc.getElementById('__markdown-viewer__hljs_css');
		if (hlselect.value.endsWith('auto')) {
			const dark = `${hlselect.value.slice(0, -4)}dark`;
			const light = `${hlselect.value.slice(0, -4)}light`;
			setExtensionStylesheetAuto(`/lib/highlightjs/build/styles/${dark}.min.css`,
									   `/lib/highlightjs/build/styles/${light}.min.css`, sheet);
		} else {
			setExtensionStylesheet(`/lib/highlightjs/build/styles/${hlselect.value}.min.css`, sheet);
		}
		webext.storage.sync.set({chosen_hl_style: hlselect.value});
		createHTMLSourceBlob(doc);
	})

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

function buildDownloadButton(doc) {
	const a = doc.createElement('p').appendChild(doc.createElement('a'));
	a.parentNode.className = 'toggleable'
	a.id = '__markdown-viewer__download';
	a.download = 'markdown.html';
	a.innerText = 'Download as HTML';
	a.style.display = 'none';

	return Promise.resolve(a.parentNode);
}

function buildTableOfContents(doc) {
	const allHeaders = doc.querySelectorAll(headerTags.join(','));
	if (allHeaders.length) {
		const tocdiv = doc.createElement('div');
		let level = 0;
		let list = tocdiv.appendChild(doc.createElement('ul'));
		for (const header of allHeaders) {
			/* Open/close the right amount of nested lists to fit tag level */
			const headerLevel = headerTags.indexOf(header.tagName);
			for (; level < headerLevel; level++) {
				if (list.lastChild === null || list.lastChild.tagName !== 'LI') {
					list.appendChild(doc.createElement('li'))
				}
				list = list.lastChild.appendChild(doc.createElement('ul'));
			}
			for (; level > headerLevel; level--) {
				list = list.parentNode.parentNode;
			}

			/* Make a list item with a link to the heading */
			const link = doc.createElement('a');
			link.textContent = header.textContent;
			link.href = `#${header.id}`;
			list.appendChild(doc.createElement('li')).appendChild(link);
		}

		/* Squash empty levels by moving its children to the parent list */
		for (const deleteList of tocdiv.querySelectorAll('li > ul:only-child')) {
			const parentItem = deleteList.parentNode;
			const parentList = parentItem.parentNode;
			while (deleteList.children.length) {
				parentList.appendChild(deleteList.removeChild(deleteList.firstChild));
			}
			parentList.removeChild(parentItem);
		}

		tocdiv.id = '__markdown-viewer__toc';
		tocdiv.className = 'toggleable'
		return Promise.resolve(tocdiv);
	}
	else {
		return Promise.resolve(null);
	}
}

function addMarkdownViewerMenu(doc) {
	const toolsdiv = doc.createElement('div');
	toolsdiv.id = '__markdown-viewer__tools';
	toolsdiv.className = 'hidden';
	const getMenuDisplay = webext.storage.sync.get({'display_menu': 'floating'});

	const input = toolsdiv.appendChild(doc.createElement('input'));
	const label = toolsdiv.appendChild(doc.createElement('label'));
	input.type = 'checkbox';
	input.id = '__markdown-viewer__show-tools';
	label.setAttribute('for', input.id);

	const p = [getMenuDisplay, buildTableOfContents(doc), buildStyleOptions(doc), buildDownloadButton(doc)];
	return Promise.all(p).then(([{display_menu: menuDisplay}, ...nodes]) => {
		toolsdiv.className = menuDisplay;
		for (const node of nodes) {
			if (node) {
				toolsdiv.appendChild(node);
			}
		}
		doc.body.prepend(toolsdiv);
	});
}

function revealDisclosures(doc, state) {
	state.splice(0, state.length);
	state.push(...Array.from(doc.getElementsByTagName('details')).map(tag => {
		const wasOpen = tag.getAttribute('open');
		tag.setAttribute('open', true)
		return wasOpen;
	}))
}

function restoreDisclosures(doc, state) {
	Array.from(doc.getElementsByTagName('details')).forEach((tag, idx) => {
		if (state[idx] === null) {
			tag.removeAttribute('open')
		} else {
			tag.setAttribute('open', state[idx])
		}
	})
}

function render(doc, text, inserter) {
	return webext.storage.sync.get({'plugins': {}}).then(storage => ({...pluginDefaults, ...storage.plugins}))
		.then(pluginPrefs => new Renderer(pluginPrefs).render(text))
		.then(({ html }) => processRenderedMarkdown(html))
		.then(({ DOM: renderedDOM, title }) => {
			makeDocHeader(doc, renderedDOM, title);
			inserter(renderedDOM);
		})
		.then(() => addMarkdownViewerMenu(doc))
		.then(() => createHTMLSourceBlob(doc))
		.catch(console.error);
}

function setupEvents(doc, win, url) {
	const hash = url.lastIndexOf('#');
	if (hash > 0) {url = url.substr(0, hash);}	// Exclude fragment id from key.
	const scrollPosKey = `${encodeURIComponent(url)}.scrollPosition`;

	try {
		win.scrollTo(...JSON.parse(sessionStorage[scrollPosKey] || '[0,0]'));
	} catch(err) {}

	win.addEventListener("unload", () => {
		sessionStorage[scrollPosKey] = JSON.stringify([win.scrollX, win.scrollY]);
	});

	const disclosures = [];
	win.addEventListener('beforeprint', () => revealDisclosures(doc, disclosures));
	win.addEventListener('afterprint', () => restoreDisclosures(doc, disclosures));
}


function renderInDocument(doc, text, { inserter, url }) {
	render(doc, text, inserter).then(() => {
		setupEvents(doc, window, url);
	});
}

function renderInIframe(parentDoc, text, { inserter, url }) {
	const iframe = parentDoc.createElement("iframe");
	iframe.sandbox = "allow-same-origin allow-top-navigation-by-user-activation";
	iframe.referrerpolicy = "no-referrer";
	iframe.name = "sandbox";

	// An iframe cannot be fully initialized befor it is embedded into the doc.
	inserter(iframe);

	return new Promise(resolve => {
		iframe.addEventListener("load", () => resolve(iframe.contentDocument));
		iframe.src = webext.extension.getURL('/ext/frame.html');
	}).then(doc => {
		render(doc, text, n => doc.body.appendChild(n)).then(() => {
			parentDoc.title = doc.title;
			setupEvents(parentDoc, iframe.contentWindow, url);

			// Can’t access the blobs from an iframe, so forward the same click
			// to an identical link outside the iframe
			buildDownloadButton(parentDoc).then(node => {
				node.display = 'hidden';
				const button = doc.getElementById('__markdown-viewer__download');
				const a = node.firstChild;
				button.addEventListener('click', e => {
					a.href = button.href;
					a.click(e);
				}, false);
			});
		});

		window.addEventListener('hashchange', (e) => {
			iframe.contentWindow.location.hash = window.location.hash;
		});
		iframe.contentWindow.addEventListener('hashchange', () => {
			window.location.hash = iframe.contentWindow.location.hash;
		});
	});
}
