ESLINT:=node ./node_modules/eslint/bin/eslint.js
FORMAT:=unix

ENV=webextensions
lint-worker: ENV=worker

lint-worker: GLOBALS=Renderer
lint-renderer: GLOBALS=markdownit fancyList texmath katex hljs markdownitCheckbox markdownitEmoji markdownitFootnote frontmatter yamltitle
lint-builder: GLOBALS=Renderer
lint-inject lint-view-md: GLOBALS=webext renderInIframe renderInDocument addExtensionStylesheet

TARGETS:=$(patsubst ext/%.js,lint-%,$(wildcard ext/*.js))
lint: ${TARGETS}

lint-%: ext/%.js
	@${ESLINT} -c .eslintrc.yaml -f ${FORMAT} --env=${ENV} $(addprefix --global=,${GLOBALS}) $<

.PHONY: lint
