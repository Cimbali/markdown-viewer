'use strict';

const webext = typeof browser === 'undefined' ? chrome : browser;
const headerTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
const pluginDefaults = {'hljs': true, 'checkbox': true, 'emojis': true, 'footnotes': false, 'fancy-lists': false,
						'texmath': false, 'mermaid': false};

const mdcss = {'default': 'sss', 'github': 'github'}
const hlcss = [
	'a11y-dark', 'a11y-light', 'a11y-auto', 'agate', 'androidstudio', 'an-old-hope', 'arduino-light', 'arta', 'ascetic',
	'atom-one-dark', 'atom-one-dark-reasonable', 'atom-one-light', 'base16/3024', 'base16/apathy', 'base16/apprentice',
	'base16/ashes', 'base16/atelier-cave-light', 'base16/atelier-cave', 'base16/atelier-cave-auto',
	'base16/atelier-dune-light', 'base16/atelier-dune', 'base16/atelier-dune-auto', 'base16/atelier-estuary-light',
	'base16/atelier-estuary', 'base16/atelier-estuary-auto', 'base16/atelier-forest-light', 'base16/atelier-forest',
	'base16/atelier-forest-auto', 'base16/atelier-heath-light', 'base16/atelier-heath', 'base16/atelier-heath-auto',
	'base16/atelier-lakeside-light', 'base16/atelier-lakeside', 'base16/atelier-lakeside-auto',
	'base16/atelier-plateau-light', 'base16/atelier-plateau', 'base16/atelier-plateau-auto',
	'base16/atelier-savanna-light', 'base16/atelier-savanna', 'base16/atelier-savanna-auto',
	'base16/atelier-seaside-light', 'base16/atelier-seaside', 'base16/atelier-seaside-auto',
	'base16/atelier-sulphurpool-light', 'base16/atelier-sulphurpool', 'base16/atelier-sulphurpool-auto', 'base16/atlas',
	'base16/bespin', 'base16/black-metal-bathory', 'base16/black-metal-burzum', 'base16/black-metal-dark-funeral',
	'base16/black-metal-gorgoroth', 'base16/black-metal-immortal', 'base16/black-metal-khold',
	'base16/black-metal-marduk', 'base16/black-metal-mayhem', 'base16/black-metal-nile', 'base16/black-metal-venom',
	'base16/black-metal', 'base16/brewer', 'base16/bright', 'base16/brogrammer', 'base16/brush-trees-dark',
	'base16/brush-trees', 'base16/chalk', 'base16/circus', 'base16/classic-dark', 'base16/classic-light',
	'base16/classic-auto', 'base16/codeschool', 'base16/colors', 'base16/cupcake', 'base16/cupertino', 'base16/danqing',
	'base16/darcula', 'base16/dark-violet', 'base16/darkmoss', 'base16/darktooth', 'base16/decaf',
	'base16/default-dark', 'base16/default-light', 'base16/default-auto', 'base16/dirtysea', 'base16/dracula',
	'base16/edge-dark', 'base16/edge-light', 'base16/edge-auto', 'base16/eighties', 'base16/embers',
	'base16/equilibrium-dark', 'base16/equilibrium-gray-dark', 'base16/equilibrium-gray-light',
	'base16/equilibrium-gray-auto', 'base16/equilibrium-light', 'base16/espresso', 'base16/eva-dim', 'base16/eva',
	'base16/flat', 'base16/framer', 'base16/fruit-soda', 'base16/gigavolt', 'base16/github', 'base16/google-dark',
	'base16/google-light', 'base16/google-auto', 'base16/grayscale-dark', 'base16/grayscale-light',
	'base16/grayscale-auto', 'base16/green-screen', 'base16/gruvbox-dark-hard', 'base16/gruvbox-dark-medium',
	'base16/gruvbox-dark-pale', 'base16/gruvbox-dark-soft', 'base16/gruvbox-light-hard', 'base16/gruvbox-light-medium',
	'base16/gruvbox-light-soft', 'base16/hardcore', 'base16/harmonic16-dark', 'base16/harmonic16-light',
	'base16/harmonic16-auto', 'base16/heetch-dark', 'base16/heetch-light', 'base16/heetch-auto', 'base16/helios',
	'base16/hopscotch', 'base16/horizon-dark', 'base16/horizon-light', 'base16/horizon-auto', 'base16/humanoid-dark',
	'base16/humanoid-light', 'base16/humanoid-auto', 'base16/ia-dark', 'base16/ia-light', 'base16/ia-auto',
	'base16/icy-dark', 'base16/ir-black', 'base16/isotope', 'base16/kimber', 'base16/london-tube', 'base16/macintosh',
	'base16/marrakesh', 'base16/materia', 'base16/material-darker', 'base16/material-lighter',
	'base16/material-palenight', 'base16/material-vivid', 'base16/material', 'base16/mellow-purple',
	'base16/mexico-light', 'base16/mocha', 'base16/monokai', 'base16/nebula', 'base16/nord', 'base16/nova',
	'base16/ocean', 'base16/oceanicnext', 'base16/one-light', 'base16/onedark', 'base16/outrun-dark',
	'base16/papercolor-dark', 'base16/papercolor-light', 'base16/papercolor-auto', 'base16/paraiso', 'base16/pasque',
	'base16/phd', 'base16/pico', 'base16/pop', 'base16/porple', 'base16/qualia', 'base16/railscasts', 'base16/rebecca',
	'base16/ros-pine-dawn', 'base16/ros-pine-moon', 'base16/ros-pine', 'base16/sagelight', 'base16/sandcastle',
	'base16/seti-ui', 'base16/shapeshifter', 'base16/silk-dark', 'base16/silk-light', 'base16/silk-auto',
	'base16/snazzy', 'base16/solar-flare-light', 'base16/solar-flare', 'base16/solar-flare-auto',
	'base16/solarized-dark', 'base16/solarized-light', 'base16/solarized-auto', 'base16/spacemacs', 'base16/summercamp',
	'base16/summerfruit-dark', 'base16/summerfruit-light', 'base16/summerfruit-auto',
	'base16/synth-midnight-terminal-dark', 'base16/synth-midnight-terminal-light',
	'base16/synth-midnight-terminal-auto', 'base16/tango', 'base16/tender', 'base16/tomorrow-night', 'base16/tomorrow',
	'base16/twilight', 'base16/unikitty-dark', 'base16/unikitty-light', 'base16/unikitty-auto', 'base16/vulcan',
	'base16/windows-10-light', 'base16/windows-10', 'base16/windows-10-auto', 'base16/windows-95-light',
	'base16/windows-95', 'base16/windows-95-auto', 'base16/windows-high-contrast-light', 'base16/windows-high-contrast',
	'base16/windows-high-contrast-auto', 'base16/windows-nt-light', 'base16/windows-nt', 'base16/windows-nt-auto',
	'base16/woodland', 'base16/xcode-dusk', 'base16/zenburn', 'brown-paper', 'codepen-embed', 'color-brewer', 'dark',
	'default', 'devibeans', 'docco', 'far', 'felipec', 'foundation', 'github-dark-dimmed', 'github-dark', 'github',
	'gml', 'googlecode', 'gradient-dark', 'gradient-light', 'gradient-auto', 'grayscale', 'hybrid', 'idea',
	'intellij-light', 'ir-black', 'isbl-editor-dark', 'isbl-editor-light', 'isbl-editor-auto', 'kimbie-dark',
	'kimbie-light', 'kimbie-auto', 'lightfair', 'lioshi', 'magula', 'mono-blue', 'monokai', 'monokai-sublime',
	'night-owl', 'nnfx-dark', 'nnfx-light', 'nnfx-auto', 'nord', 'obsidian', 'panda-syntax-dark', 'panda-syntax-light',
	'panda-syntax-auto', 'paraiso-dark', 'paraiso-light', 'paraiso-auto', 'pojoaque', 'purebasic', 'qtcreator-dark',
	'qtcreator-light', 'qtcreator-auto', 'rainbow', 'routeros', 'school-book', 'shades-of-purple', 'srcery',
	'stackoverflow-dark', 'stackoverflow-light', 'stackoverflow-auto', 'sunburst', 'tokyo-night-dark', 'xt256',
	'tokyo-night-light', 'tokyo-night-auto', 'tomorrow-night-blue', 'tomorrow-night-bright', 'vs2015', 'vs', 'xcode',
]

const parser = new DOMParser();

// Global flag to remember whether menu is opened on refresh
let showMenu = false;


function addStylesheet(doc, href, attributes) {
	const link = doc.createElement('link');
	link.rel = 'stylesheet';
	link.type = 'text/css';
	link.href = href;
	for (const [attr, val] of Object.entries(attributes || {})) {
		link.setAttribute(attr, val);
	}
	doc.head.appendChild(link);
	return link
}

function addExtensionStylesheet(doc, href, attributes) {
	// If injecting (?), need full path to stylesheet
	addStylesheet(doc, new URL(href, webext.extension.getURL('/')).href, attributes);
}

function setExtensionStylesheet(href, sheet) {
	// If injecting (?), need full path to stylesheet
	const prevURL = new URL(sheet.href);
	if (prevURL.protocol === 'blob:') {
		URL.revokeObjectURL(prevURL.href);
	}
	sheet.href = new URL(href, webext.extension.getURL('/')).href;
}

function setExtensionStylesheetAuto(hrefDark, hrefLight, sheet) {
	const sheetContent = `
	@import url("${webext.extension.getURL(hrefLight)}") (prefers-color-scheme: light);
	@import url("${webext.extension.getURL(hrefDark)}") (prefers-color-scheme: dark);
	`
	const url = URL.createObjectURL(new Blob([sheetContent], {type: "text/css"}));
	setExtensionStylesheet(url, sheet);
}

function addCustomStylesheet(doc, attributes) {
	return webext.storage.sync.get({'custom_css': ''}).then(({custom_css: data}) => {
		const url = URL.createObjectURL(new Blob([data], {type: "text/css"}));
		addStylesheet(doc, url, attributes);
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

async function convertLinkToStylesheet(doc, node) {
	const style = doc.createElement('style');
	const url = new URL(node.href);
	if (node.getAttribute('id') === '__markdown-viewer__custom_css') {
		const { custom_css: css } = await webext.storage.sync.get({'custom_css': ''});
		style.textContent = css;
	} else if (node.getAttribute('id') === '__markdown-viewer__hljs_css' && url.protocol === 'blob:') {
		const autoStyle = node.getAttribute('data-style-auto');
		const styleSheets = {
			dark: `/lib/@highlightjs/cdn-assets/styles/${autoStyle.slice(0, -4)}dark.min.css`,
			light: `/lib/@highlightjs/cdn-assets/styles/${autoStyle.slice(0, -4)}light.min.css`,
		}

		for (const [colorScheme, loc] of Object.entries(styleSheets)) {
			const content = await fetch(webext.extension.getURL(loc)).then(r => r.text());
			style.textContent += `@media (prefers-color-scheme: ${colorScheme}) { ${content} }\n`
		}
	} else if (url.href === webext.extension.getURL(url.pathname)) {
		style.textContent = await fetch(node.href).then(r => r.text());
	} else {
		throw new Error('Untrusted stylesheet');
	}

	if (node.hasAttribute('media')) {
		style.setAttribute('media', node.getAttribute('media'));
	}

	return style.outerHTML;
}

async function createHTMLSourceBlob(doc) {
	const a = doc.getElementById('__markdown-viewer__download');
	const opt = doc.getElementById('__markdown-viewer__styleselect');
	if (a === null) {
		return
	}

	if (a.href) {
		URL.revokeObjectURL(a.href);
	}

	// create a string containing the html headers, but inline all the <link rel="stylesheet" /> tags
	const head = [];
	for (const node of doc.head.children) {
		if (node.tagName === 'LINK' && node.hasAttribute('rel') && node.getAttribute('rel').includes('stylesheet')) {
			if (!node.hasAttribute('href') || new URL(node.href).protocol === 'resource:') {
				continue;
			}

			try {
				head.push(await convertLinkToStylesheet(doc, node))
			} catch (e) {
				// Ignore bad URLs, fetch errors, untrusted sheets
				continue;
			}
		} else if (node.tagName !== 'SCRIPT') {
			head.push(node.outerHTML);
		}
	}

	// Hide the download button and style options, so they do not appear in the downloaded html.
	a.style.display = 'none';
	opt.style.display = 'none';

	const html = `<html><head>${head.join('\n')}</head>${doc.body.outerHTML}</html>`;
	a.href = URL.createObjectURL(new Blob([html], {type: "text/html"}));

	a.style.display = 'inline-block';
	opt.style.display = 'block';
}

function makeDocHeader(doc) {
	const styleSheetsDone = Promise.all([
		// Style the page and code highlights.
		addExtensionStylesheet(doc, '/ext/sss/sss.css', {media: 'screen', id: '__markdown-viewer__md_css'}),
		addExtensionStylesheet(doc, '/ext/sss/print.css', {media: 'print', id: '__markdown-viewer__md_print_css'}),
		addExtensionStylesheet(doc, '/lib/@highlightjs/cdn-assets/styles/default.min.css',
							   {id: '__markdown-viewer__hljs_css'}),
		addExtensionStylesheet(doc, '/srclib/katex/dist/katex.min.css', {id: '__markdown-viewer__katex_css'}),
		addExtensionStylesheet(doc, '/lib/markdown-it-texmath/css/texmath.css', {id: '__markdown-viewer__texmath_css'}),
		addExtensionStylesheet(doc, '/ext/menu.css', {id: '__markdown-viewer__menu_css'}),
		// User-defined stylesheet.
		addCustomStylesheet(doc, {id: '__markdown-viewer__custom_css'}),
	])

	// This is considered a good practice for mobiles.
	const viewport = doc.createElement('meta');
	viewport.name = 'viewport';
	viewport.content = 'width=device-width, initial-scale=1';
	doc.head.appendChild(viewport);

	return styleSheetsDone;
}

function makeDocTitle(markdownRoot, title) {
	// Set the page title.
	if (!title) {
		// Get first line if no header.
		title = markdownRoot.textContent.trim().split("\n", 1)[0].trim();
	}
	if (title.length > 128) {
		// Limit its length.
		title = `${title.substr(0, 125)  }...`;
	}

	return title;
}

function processRenderedMarkdown(html, title, pageUrl) {
	// Parse the element’s content Markdown to HTML, inside a div.markdownRoot
	const doc = parser.parseFromString(`<div class="markdownRoot">${html}</div>`, "text/html");
	const markdownRoot = doc.body.removeChild(doc.body.firstChild);

	// Perform some cleanup and extract headers
	const documentAnchors = [];
	const jsLink = /^\s*javascript:/iu;
	const allElements = doc.createNodeIterator(markdownRoot, NodeFilter.SHOW_ELEMENT);
	for (let node = allElements.nextNode(); node; node = allElements.nextNode()) {
		const tagName = node.tagName.toUpperCase();

		// Make anchor for headers; use first header text as page title.
		if (headerTags.includes(tagName)) {
			const anchor = makeAnchor(node, documentAnchors);
			documentAnchors.push(node.id = anchor);
			if (!title) {
				title = node.textContent.trim();
			}
		}

		if (tagName === 'A' && !node.href.startsWith('#')) {
			node.target = '_top';
			if (pageUrl) {
				node.href = new URL(node.getAttribute('href'), pageUrl);
			}
		}
		if (tagName === 'IMG' && pageUrl) {
			node.src = new URL(node.getAttribute('src'), pageUrl);
		}


		// Crush scripts.
		if (tagName === 'SCRIPT') {
			node.remove();
		}
		// Trample JavaScript hrefs.
		if (node.getAttribute("href") && jsLink.test(node.href)) {
			node.removeAttribute("href");
		}
		// Remove event handlers.
		for (const attr of node.attributes) {
			if (attr.name.toLowerCase().startsWith('on')) {
				node.removeAttribute(attr.name);
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
	p.id = '__markdown-viewer__styleselect';

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

		setExtensionStylesheet(`/ext/sss/${mdchosen}.css`,
								doc.getElementById('__markdown-viewer__md_css'));

		webext.storage.sync.set({ chosen_md_style: mdselect.value });
		createHTMLSourceBlob(doc);
	})

	const hlselect = p.appendChild(doc.createElement('select'));
	hlselect.id = '__markdown-viewer__hlselect';
	for (const hlopt of hlcss) {
		const opt = hlselect.appendChild(doc.createElement('option'));
		opt.value = hlopt;
		opt.textContent = hlopt.substring(hlopt.lastIndexOf('/') + 1);
		opt.selected = hlopt === 'default';
	}

	hlselect.addEventListener('change', () => {
		const sheet = doc.getElementById('__markdown-viewer__hljs_css');
		if (hlselect.value.endsWith('-auto')) {
			const base = hlselect.value.slice(0, -5);
			const dark = hlcss.includes(`${base}-dark`) ? `${base}-dark` : base;
			const light = `${base}-light`;
			setExtensionStylesheetAuto(`/lib/@highlightjs/cdn-assets/styles/${dark}.min.css`,
									   `/lib/@highlightjs/cdn-assets/styles/${light}.min.css`, sheet);
			sheet.setAttribute('data-style-auto', hlselect.value)
		} else {
			setExtensionStylesheet(`/lib/@highlightjs/cdn-assets/styles/${hlselect.value}.min.css`, sheet);
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

function buildSourceLink(doc, url) {
	if (new URL(url).protocol === 'blob:') {
		return Promise.resolve(null);
	}

	const a = doc.createElement('p').appendChild(doc.createElement('a'));
	a.parentNode.className = 'toggleable'
	a.target = '_top';
	a.href = `view-source:${url}`;
	a.id = '__markdown-viewer__source';
	a.innerText = 'View Source';

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
			link.target = '_top';
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

function addMarkdownViewerMenu(doc, url) {
	const toolsdiv = doc.createElement('div');
	toolsdiv.id = '__markdown-viewer__tools';
	toolsdiv.className = 'hidden';
	const getMenuDisplay = webext.storage.sync.get({'display_menu': 'floating'});

	const input = toolsdiv.appendChild(doc.createElement('input'));
	const label = toolsdiv.appendChild(doc.createElement('label'));
	input.type = 'checkbox';
	input.id = '__markdown-viewer__show-tools';
	input.checked = showMenu;
	label.setAttribute('for', input.id);

	return Promise.all([
		getMenuDisplay,
		buildTableOfContents(doc),
		buildStyleOptions(doc),
		buildDownloadButton(doc),
		buildSourceLink(doc, url),
	]).then(([{display_menu: menuDisplay}, ...nodes]) => {
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

function render(doc, text, { inserter, url, displayUrl, skipHeader=false }) {
	const baseUrl = displayUrl || url || doc.defaultView.location.href;
	return webext.storage.sync.get({'plugins': {}}).then(storage => ({...pluginDefaults, ...storage.plugins}))
		.then(pluginPrefs => {
			return new Renderer(pluginPrefs).render(text)
				.then(({ html, title }) => processRenderedMarkdown(html, title, baseUrl))
				.then(({ DOM: renderedDOM, title }) => {
					if (!skipHeader) {
						makeDocHeader(doc);
					}
					doc.title = makeDocTitle(renderedDOM, title);
					(inserter || doc.appendChild)(renderedDOM);

					if (pluginPrefs.mermaid) {
						for (const pre of doc.getElementsByClassName('mermaid')) {
							if (pre.tagName !== 'PRE') {
								continue;
							}
							// Mermaid rendering asychronously
							Promise.resolve().then(() => {
								const svg = mermaid.mermaidAPI.render('mermaid', pre.innerText);
								const img = parser.parseFromString(svg, 'image/svg+xml')
								pre.parentNode.replaceChild(img.firstChild, pre);
							}).catch(console.error)
						}
					}
				})
				.then(() => addMarkdownViewerMenu(doc, baseUrl))
				.then(() => createHTMLSourceBlob(doc))
		})
		.catch(console.error);
}

function preventRefresh(evt) {
	if (evt.altKey || evt.metaKey || evt.shiftKey || evt.repeat) {
		return false;
	}

	if (evt.key === 'F5' && !evt.ctrlKey || evt.key === 'r' && evt.ctrlKey) {
		evt.stopPropagation();
		evt.preventDefault();

		return true;
	}

	return false;
}

function replaceMarkdownDOM(doc) {
	return function replaceWith(node) {
		showMenu = doc.getElementById('__markdown-viewer__show-tools').checked;

		while (doc.body.children.length) {
			doc.body.removeChild(doc.body.firstChild);
		}

		doc.body.appendChild(node);
	}
}

function setupEvents(doc, win, { url, displayUrl }) {
	if (url) {
		win.addEventListener('keydown', e => {
			if (!preventRefresh(e)) {
				return;
			}

			fetch(url).then(r => r.text()).then(text => {
				render(doc, text, { inserter: replaceMarkdownDOM(doc), url, displayUrl, skipHeader: true });
			});
		});
	}

	const disclosures = [];
	win.addEventListener('beforeprint', () => revealDisclosures(doc, disclosures));
	win.addEventListener('afterprint', () => restoreDisclosures(doc, disclosures));
}

/* exported renderInDocument */
function renderInDocument(doc, text, opts) {
	return render(doc, text, opts).then(() => {
		setupEvents(doc, window, opts);
	});
}

/* exported renderInIframe */
function renderInIframe(parentDoc, text, { inserter, ...opts }) {
	const iframe = parentDoc.createElement("iframe");
	iframe.sandbox = "allow-same-origin allow-top-navigation-by-user-activation";
	iframe.referrerpolicy = "no-referrer";
	iframe.name = "sandbox";

	// An iframe cannot be fully initialized before it is embedded into the doc.
	inserter(iframe);

	return new Promise(resolve => {
		iframe.addEventListener("load", () => resolve(iframe.contentDocument));
		iframe.srcdoc = `<!DOCTYPE html><html>
			<head><meta charset="utf-8"><link rel="stylesheet" type="text/css" href="/ext/spinner.css" /></head>
			<body><div id="spinner"></div></body>
		</html>`;
	}).then(doc => {
		const spinner = doc.getElementById('spinner');
		// Render the document with an inserter that adds the markdown inside the iframe
		render(doc, text, { inserter: n => doc.body.replaceChild(n, spinner), ...opts }).then(() => {
			parentDoc.title = doc.title;
			setupEvents(doc, iframe.contentWindow, opts);

			// Listen for refresh keys and print events on parent window too
			setupEvents(doc, window, opts);

			// Can’t access the blobs from an iframe, so forward the same click
			// to an identical link outside the iframe
			buildDownloadButton(parentDoc).then(node => {
				node.display = 'hidden';
				const button = doc.getElementById('__markdown-viewer__download');
				const a = node.firstChild;
				button.addEventListener('click', e => {
					a.href = button.href;
					a.click();
					e.preventDefault();
				}, false);
			});
		});

		window.addEventListener('hashchange', () => {
			iframe.contentWindow.location.hash = window.location.hash;
		});
		iframe.contentWindow.addEventListener('hashchange', () => {
			window.location.hash = iframe.contentWindow.location.hash;
		});
	});
}
