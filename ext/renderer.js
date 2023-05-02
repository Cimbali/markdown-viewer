'use strict';

/* exported Renderer */
class Renderer {
	constructor(plugins) {
		this.plugins = plugins;
	}

	highlightCodeBlock(str, lang) {
		// Shameless copypasta https://github.com/markdown-it/markdown-it#syntax-highlighting
		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(str, {language: lang}).value;
			} catch (e) {}
		}

		try {
			return hljs.highlightAuto(str).value;
		} catch (e) {}
		return ''; // use external default escaping
	}

	getRenderer(plugins) {
		const md = markdownit({
			html: true,
			linkify: true,
			...plugins.hljs ? {highlight: this.highlightCodeBlock} : {},
		})
		hljs.configure({ throwUnescapedHTML: true });
		//markdown-it plugins:
		if (plugins.checkbox) {md.use(markdownitCheckbox);}
		if (plugins.emojis) {md.use(markdownitEmoji);}
		if (plugins.footnotes) {md.use(markdownitFootnote);}
		if (plugins.texmath) {
			const tm = texmath.use(katex);
			md.use(tm, {
				engine: katex,
				delimiters:'dollars',
				katexOptions: { macros: {"\\RR": "\\mathbb{R}"} }
			})
		}
		if (plugins['fancy-lists']) {
			md.block.ruler.at('list', fancyList, { alt: [ 'paragraph', 'reference', 'blockquote' ] });
		}
		if (plugins.frontmatter) {
			md.block.ruler.before('table', 'frontmatter', frontmatter(yaml => {
				this.title = yamltitle(yaml)
			}));
		}
		if (plugins.mermaid) {
			const origFenceRules = md.renderer.rules.fence.bind(md.renderer.rules);
			md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
				const token = tokens[idx]
				if (token.info === 'mermaid') {
					return `<pre class="mermaid">${token.content.trim()}</pre>`
				}
				return origFenceRules(tokens, idx, options, env, slf)
			}
		}

		return md;
	}

	work(text) {
		const html = this.getRenderer(this.plugins).render(text);
		return Promise.resolve({ html, title: this.title });
	}

	offload(text) {
		const worker = new Worker('./worker.js');
		const { plugins } = this;

		return new Promise((resolve, reject) => {
			worker.addEventListener('message', e => {
				resolve(e.data);
				worker.terminate();
			});
			worker.addEventListener('error', reject);
			worker.postMessage({ plugins, text });
		});
	}

	// If we did not load the scripts we need to offload
	static prefersOffloading = typeof markdownit === 'undefined';

	render(text) {
		if (Renderer.prefersOffloading) {
			return this.offload(text);
		} else {
			return this.work(text);
		}
	}
}
