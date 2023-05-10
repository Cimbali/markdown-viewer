ESLINT:=node ./node_modules/eslint/bin/eslint.js
FORMAT:=unix

ENV=webextensions
lint-worker: ENV=worker

lint-worker: GLOBALS=Renderer
lint-renderer: GLOBALS=markdownit fancyList texmath katex hljs markdownitCheckbox markdownitEmoji markdownitFootnote frontmatter yamltitle
lint-builder: GLOBALS=Renderer
lint-onboarding: GLOBALS=webext
lint-inject lint-view-md: GLOBALS=webext renderInIframe renderInDocument addExtensionStylesheet

TARGETS:=$(patsubst ext/%.js,lint-%,$(wildcard ext/*.js))
lint: ${TARGETS}

lint-%: ext/%.js
	@${ESLINT} -c .eslintrc.yaml -f ${FORMAT} --env=${ENV} $(addprefix --global=,${GLOBALS}) $<


BUILDDIR:=staging
OUTDIR:=web-ext-artifacts
VERSION:=$(shell jq -r .version manifest.json)
TARGET:=${OUTDIR}/markdown_viewer_webext-${VERSION}.zip
SIGNED:=${OUTDIR}/markdown_viewer_webext-${VERSION}.xpi

FILES:=manifest.json \
  $(wildcard ext/*) \
  lib/highlightjs/build/highlight.min.js \
  $(wildcard lib/highlightjs/build/styles/*.min.css) \
  $(wildcard lib/highlightjs/build/styles/base16/*.min.css) \
  lib/markdown-it/dist/markdown-it.min.js \
  lib/markdown-it-checkbox/dist/markdown-it-checkbox.min.js \
  lib/markdown-it-emoji/dist/markdown-it-emoji.min.js \
  lib/markdown-it-footnote/dist/markdown-it-footnote.min.js \
  lib/markdown-it-fancy-lists/markdown-it-fancy-lists.js \
  lib/markdown-it-texmath/texmath.js \
  lib/markdown-it-texmath/css/texmath.css \
  lib/katex/dist/katex.min.js \
  lib/katex/dist/katex.min.css \
  lib/sss/sss.css \
  lib/sss/print.css \
  lib/sss/github.css

STAGED_FILES:=$(addprefix ${BUILDDIR}/,${FILES})

${BUILDDIR}:
	@mkdir -p ${BUILDDIR}

lib/katex/dist/katex.min.%:
	@cd lib/katex && yarn install && USE_TTF=false USE_WOFF=false USE_WOFF2=false yarn build

${BUILDDIR}/%: %
	@mkdir -p "$(@D)" && cp "$<" "$@"

build: ${TARGET}
sign: ${SIGNED}
release: ${SIGNED}

# make sign -> private, make release -> public
CHANNEL:=unlisted
release: CHANNEL=listed

# if running web-ext sign without credentials set, prompt
ifneq ($(filter release sign ${SIGNED},$(MAKECMDGOALS)),)
ifndef WEBEXT_SIGN_ARGS
WEBEXT_SIGN_ARGS=$(shell kwallet-query -r 'API credentials for addons.mozilla.org' kdewallet) --channel ${CHANNEL}
endif
endif

${OUTDIR}/%.zip: ${STAGED_FILES} | ${BUILDDIR}
	@web-ext build -s "${BUILDDIR}" -a "${OUTDIR}" -o

${OUTDIR}/%.xpi: ${STAGED_FILES} | ${BUILDDIR}
	@web-ext sign -s "${BUILDDIR}" -a "${OUTDIR}" ${WEBEXT_SIGN_ARGS}

clean:
	@rm -rf ${BUILDDIR} ${OUTDIR}

.PHONY: lint prep build clean stage sign release
.INTERMEDIATE: ${STAGED_FILES}
