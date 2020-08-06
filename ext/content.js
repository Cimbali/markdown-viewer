const webext = typeof browser === 'undefined' ? chrome : browser;
const headerTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
var pluginDefaults = {'checkbox': true, 'emojis': true, 'footnotes': false, 'fancy-lists': false};

var mdcss = {'default': 'sss', 'github': 'github'}
var hlcss = 'agate,androidstudio,arduino-light,arta,ascetic,atelier-cave.dark,atelier-cave.light,atelier-cave-dark,atelier-cave-light,atelier-dune.dark,atelier-dune.light,atelier-dune-dark,atelier-dune-light,atelier-estuary.dark,atelier-estuary.light,atelier-estuary-dark,atelier-estuary-light,atelier-forest.dark,atelier-forest.light,atelier-forest-dark,atelier-forest-light,atelier-heath.dark,atelier-heath.light,atelier-heath-dark,atelier-heath-light,atelier-lakeside.dark,atelier-lakeside.light,atelier-lakeside-dark,atelier-lakeside-light,atelier-plateau.dark,atelier-plateau.light,atelier-plateau-dark,atelier-plateau-light,atelier-savanna.dark,atelier-savanna.light,atelier-savanna-dark,atelier-savanna-light,atelier-seaside.dark,atelier-seaside.light,atelier-seaside-dark,atelier-seaside-light,atelier-sulphurpool.dark,atelier-sulphurpool.light,atelier-sulphurpool-dark,atelier-sulphurpool-light,atom-one-dark,atom-one-light,brown-paper,brown_paper,codepen-embed,color-brewer,darcula,dark,darkula,default,docco,dracula,far,foundation,github,github-gist,googlecode,grayscale,gruvbox-dark,gruvbox-light,hopscotch,hybrid,idea,ir-black,ir_black,kimbie.dark,kimbie.light,magula,monokai,monokai-sublime,monokai_sublime,mono-blue,obsidian,ocean,paraiso.dark,paraiso.light,paraiso-dark,paraiso-light,pojoaque,purebasic,qtcreator_dark,qtcreator_light,railscasts,rainbow,routeros,school-book,school_book,solarized-dark,solarized-light,solarized_dark,solarized_light,sunburst,tomorrow,tomorrow-night,tomorrow-night-blue,tomorrow-night-bright,tomorrow-night-eighties,vs,vs2015,xcode,xt256,zenburn'.split(',');

function addStylesheet(href, media) {
	var style = document.createElement('link');
	style.rel = 'stylesheet';
	style.type = 'text/css';
	style.href = href;
	if (media) { style.setAttribute('media', media); }
	return document.head.appendChild(style);
}
function addExtensionStylesheet(href, media) {
	return addStylesheet(webext.extension.getURL(href), media);
}

function addCustomStylesheet() {
	var p = webext.storage.sync.get('custom_css')
	return p.then((storage) => {
		if ('custom_css' in storage) {
			var style = document.createElement('style');
			style.textContent = storage.custom_css;
			document.head.appendChild(style);
		}
	});
}

function makeAnchor(node) {
	// From @ChenYingChou https://gist.github.com/asabaylus/3071099#gistcomment-1479328
	var anchor = node.textContent.trim().toLowerCase()
		// single chars that are removed
		.replace(/[`~!@#$%^&*()+=<>?,./:;"'|{}\[\]\\–—]/g, '')
		// CJK punctuations that are removed
		.replace(/[　。？！，、；：“”【】（）〔〕［］﹃﹄“”‘’﹁﹂—…－～《》〈〉「」]/g, '')
		.replace(/\s+/g, '-').replace(/\-+$/, '');

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

async function createHTMLSourceBlob() {
	var a = document.getElementById('__markdown-viewer__download');

	/* create a string containing the html headers, but inline all the <link rel="stylesheet" /> tags */
	var header_content = '';
	for (var i = 0, t = document.head.children[i]; i < document.head.children.length; t = document.head.children[++i]) {
		if (t.tagName == 'LINK' && t.hasAttribute('rel') && t.getAttribute('rel').includes('stylesheet')) {
			if (!t.hasAttribute('href') || new URL(t.href).protocol == 'resource:') {
				continue;
			}

			/* async + await so stylesheets get processed in order, and to know when we finished parsing them all */
			try {
				var res = await window.fetch(t.href);
				var css = await res.text();
			} catch {
				continue;
			}
			var style = document.createElement('style');
			if (t.hasAttribute('media')) {
				style.setAttribute('media', t.getAttribute('media'));
			}
			style.textContent = css;
			header_content += style.outerHTML;
		}
		else {
			header_content += t.outerHTML;
		}
	}

	/* the body is copied as-is */
	var html = '<html><head>' + header_content + '</head><body>' + document.body.innerHTML + '</body></html>';
	a.href = URL.createObjectURL(new Blob([html], {type: "text/html"}));

	/* once we're done display the download button, so it does not appear in the downlaoded html */
	a.style.display = 'inline-block';
}

async function processMarkdown(textContent, plugins) {
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
	if (plugins['checkbox']) md.use(window.markdownitCheckbox);
	if (plugins['emojis']) md.use(window.markdownitEmoji);
	if (plugins['footnotes']) md.use(window.markdownitFootnote);
	if (plugins['fancy-lists']) md.block.ruler.at('list', fancyList, { alt: [ 'paragraph', 'reference', 'blockquote' ] });

	var html = md.render(textContent);

	// Style the page and code highlights.
	addExtensionStylesheet('/lib/sss/sss.css').classList.add('__markdown-viewer__md_css');
	addExtensionStylesheet('/lib/sss/sss.print.css', 'print').classList.add('__markdown-viewer__md_css');
	addExtensionStylesheet('/lib/highlightjs/styles/default.css').id = '__markdown-viewer__hljs_css';
	addExtensionStylesheet('/ext/menu.css');
	// User-defined stylesheet.
	var styleSheetDone = addCustomStylesheet();

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
	const jsLink = /^\s*javascript:/i;
	var eachElement,
		allElements = document.createNodeIterator(markdownRoot, NodeFilter.SHOW_ELEMENT);
	while (eachElement = allElements.nextNode()) {
		var tagName = eachElement.tagName.toUpperCase();

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

	return await styleSheetDone;
}

function buildStyleOptions() {
	var p = document.createElement('p');
	p.appendChild(document.createTextNode('Pick a markdown and code style:'));
	p.appendChild(document.createElement('br'));
	p.className = 'toggleable';

	var mdselect = p.appendChild(document.createElement('select'));
	mdselect.id = '__markdown-viewer__mdselect';
	Object.keys(mdcss).forEach(val => {
		var opt = mdselect.appendChild(document.createElement('option'));
		opt.textContent = val;
		opt.value = mdcss[val];
		opt.selected = opt.value == 'sss';
	});

	mdselect.onchange = () => {
		Array.from(document.getElementsByClassName('__markdown-viewer__md_css')).forEach(style => {
			var mdchosen = mdselect.value;
			if (style.hasAttribute('media')) {
				mdchosen += '.' + style.getAttribute('media');
			}
			style.href = webext.extension.getURL('/lib/sss/'+mdchosen+'.css');
		});
		webext.storage.sync.set({chosen_md_style: mdselect.value});
	}

	var hlselect = p.appendChild(document.createElement('select'));
	hlselect.id = '__markdown-viewer__hlselect';
	hlcss.forEach(val => {
		var opt = hlselect.appendChild(document.createElement('option'));
		opt.textContent = val;
		opt.value = webext.extension.getURL('/lib/highlightjs/styles/'+val+'.css');
		opt.selected = val == 'default';
	});

	hlselect.onchange = () => {
		document.getElementById('__markdown-viewer__hljs_css').href = hlselect.value;
		webext.storage.sync.set({chosen_hl_style: hlselect.value});
	}

	return webext.storage.sync.get(['chosen_md_style', 'chosen_hl_style']).then((storage) => {
		if ('chosen_md_style' in storage && mdselect.value != storage.chosen_md_style) {
			mdselect.value = storage.chosen_md_style;
			mdselect.dispatchEvent(new Event('change'));
		}

		if ('chosen_hl_style' in storage && mdselect.value != storage.chosen_hl_style) {
			hlselect.value = storage.chosen_hl_style;
			hlselect.dispatchEvent(new Event('change'));
		}

       return p;
	});
}

function buildDownloadButton() {
	var a = document.createElement('p').appendChild(document.createElement('a'));
	a.parentNode.className = 'toggleable'
	a.id = '__markdown-viewer__download';
	a.download = 'markdown.html';
	a.innerText = 'Download as HTML';
	a.style.display = 'none';

	return Promise.resolve(a.parentNode);
}

function buildTableOfContents() {
	// build a table of contents if there are any headers
	var allHeaders = Array.from(document.querySelectorAll(headerTags.join(',')));
	if (allHeaders.length) {
		// list uniquely the used header titles, so we only consider those for nesting
		var usedHeaderTags = allHeaders.map(header => header.tagName).filter((level, index, self) =>
			self.indexOf(level) == index
		).sort();

		var level = 0, tocdiv = document.createElement('div'), list = tocdiv.appendChild(document.createElement('ul'));
		Array.from(allHeaders).forEach(header => {
			/* Open/close the right amount of nested lists to fit tag level */
			var header_level = usedHeaderTags.indexOf(header.tagName);
			for (; level < header_level; level++) {
				if (list.lastChild == null || list.lastChild.tagName != 'LI')
					list.appendChild(document.createElement('li'))
				list = list.lastChild.appendChild(document.createElement('ul'));
			}
			for (; level > header_level; level--) {
				list = list.parentNode.parentNode;
			}

			/* Make a list item with a link to the heading */
			var link = document.createElement('a');
			link.textContent = header.textContent;
			link.href = '#' + header.id;
			list.appendChild(document.createElement('li')).appendChild(link);
		});

		tocdiv.id = '__markdown-viewer__toc';
		tocdiv.className = 'toggleable'
		return Promise.resolve(tocdiv);
	}
	else
		return Promise.resolve(null);
}

function addMarkdownViewerMenu() {
	var toolsdiv = document.createElement('div');
	toolsdiv.id = '__markdown-viewer__tools';
	toolsdiv.className = 'hidden';
	var getMenuDisplayDone = webext.storage.sync.get('display_menu').then(storage => {
		toolsdiv.className = 'display_menu' in storage ? storage.display_menu : 'floating';
	});

	var input = toolsdiv.appendChild(document.createElement('input'));
	var label = toolsdiv.appendChild(document.createElement('label'));
	input.type = 'checkbox';
	input.id = '__markdown-viewer__show-tools';
	label.setAttribute('for', input.id);

	var p = Promise.all([getMenuDisplayDone, buildTableOfContents(), buildStyleOptions(), buildDownloadButton()]);
	p.then(([_, ...nodes]) => {
		nodes.filter(node => node).forEach(node => toolsdiv.appendChild(node));
		document.body.prepend(toolsdiv);
	});
	return p;
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

	webext.storage.sync.get('plugins').then(storage => Object.assign(pluginDefaults, storage.plugins))
		.then(pluginPrefs => processMarkdown(textContent, pluginPrefs))
		.then(() => addMarkdownViewerMenu())
		.then(() => createHTMLSourceBlob());

	try {
		window.scrollTo.apply(window, JSON.parse(sessionStorage[scrollPosKey] || '[0,0]'));
	} catch(err) {}

	window.addEventListener("unload", () => {
		sessionStorage[scrollPosKey] = JSON.stringify([window.scrollX, window.scrollY]);
	});
}
