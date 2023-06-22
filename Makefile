ESLINT:=eslint --resolve-plugins-relative-to "$(shell npm config get prefix)/lib"
FORMAT:=unix

ENV=webextensions
lint-worker: ENV=worker

lint-worker: GLOBALS=Renderer
lint-renderer: GLOBALS=markdownit fancyList texmath katex mermaid hljs markdownitCheckbox markdownitEmoji markdownitFootnote frontmatter yamltitle
lint-builder: GLOBALS=Renderer mermaid
lint-onboarding: GLOBALS=webext
lint-inject lint-view-md: GLOBALS=webext renderInIframe renderInDocument addExtensionStylesheet pluginDefaults mermaid

TARGETS:=$(patsubst ext/%.js,lint-%,$(wildcard ext/*.js))
lint: ${TARGETS}

lint-%: ext/%.js
	@${ESLINT} -c .eslintrc.yaml -f ${FORMAT} --env=${ENV} $(addprefix --global=,${GLOBALS}) $<


BUILDDIR:=staging
OUTDIR:=web-ext-artifacts
VERSION:=$(shell jq -r .version manifest.json)
SOURCE:=${OUTDIR}/markdown_viewer_webext-${VERSION}-src.zip
TARGET:=${OUTDIR}/markdown_viewer_webext-${VERSION}.zip
SIGNED:=${OUTDIR}/markdown_viewer_webext-${VERSION}.xpi

FILES:=manifest.json \
  $(filter-out ext/sss,$(wildcard ext/*)) \
  lib/@highlightjs/cdn-assets/highlight.min.js \
  $(wildcard lib/@highlightjs/cdn-assets/styles/*.min.css) \
  $(wildcard lib/@highlightjs/cdn-assets/styles/base16/*.min.css) \
  lib/markdown-it/dist/markdown-it.min.js \
  lib/markdown-it-checkbox/dist/markdown-it-checkbox.js \
  lib/markdown-it-emoji/dist/markdown-it-emoji.js \
  lib/markdown-it-footnote/dist/markdown-it-footnote.js \
  lib/markdown-it-fancy-lists/markdown-it-fancy-lists.js \
  lib/markdown-it-texmath/texmath.js \
  lib/markdown-it-texmath/css/texmath.css \
  lib/mermaid/dist/mermaid.min.js \
  srclib/katex/dist/katex.min.js \
  srclib/katex/dist/katex.min.css \
  ext/sss/sss.css \
  ext/sss/print.css \
  ext/sss/github.css

STAGED_FILES:=$(addprefix ${BUILDDIR}/,${FILES})

${BUILDDIR}:
	@mkdir -p ${BUILDDIR}

srclib/katex/dist/katex.min.%:
	@cd srclib/katex && yarn install && USE_TTF=false USE_WOFF=false USE_WOFF2=false yarn build

${BUILDDIR}/%: %
	@mkdir -p "$(@D)" && cp "$<" "$@"

build: ${TARGET}
beta: ${SIGNED}
release: ${SIGNED}
source: ${SOURCE}

# make beta -> private, make release -> public
CHANNEL:=unlisted
release: CHANNEL=listed

# if running web-ext sign without credentials set, prompt
ifneq ($(filter release beta ${SIGNED},$(MAKECMDGOALS)),)
ifndef WEBEXT_SIGN_ARGS
WEBEXT_SIGN_ARGS=$(shell kwallet-query -r 'API credentials for addons.mozilla.org' kdewallet) --channel ${CHANNEL}
endif
endif

${OUTDIR}/%-src.zip:
	@git ls-files -z '*.json' yarn.lock ext/ | xargs -0 zip "$@"

${OUTDIR}/%.zip: ${STAGED_FILES} | ${BUILDDIR}
	@web-ext build -s "${BUILDDIR}" -a "${OUTDIR}" -o

${OUTDIR}/%.xpi: ${STAGED_FILES} | ${BUILDDIR}
	@web-ext sign -s "${BUILDDIR}" -a "${OUTDIR}" ${WEBEXT_SIGN_ARGS}

clean:
	@rm -rf ${BUILDDIR} ${OUTDIR}

.PHONY: lint prep build source clean stage sign release
.INTERMEDIATE: ${STAGED_FILES}
