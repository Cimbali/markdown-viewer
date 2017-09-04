#!/bin/sh
rm -r staging 2>/dev/null
rm -r web-ext-artifacts 2>/dev/null
for f in LICENSE \
	manifest.json \
	ext/* \
	lib/highlightjs/LICENSE \
	lib/highlightjs/highlight.pack.min.js \
	lib/highlightjs/styles/default.css \
	lib/markdown-it/LICENSE \
	lib/markdown-it/dist/markdown-it.min.js \
	lib/markdown-it-checkbox/LICENSE \
	lib/markdown-it-checkbox/dist/markdown-it-checkbox.min.js \
	lib/sss/LICENSE.md \
	lib/sss/sss.css \
	lib/sss/sss.print.css
do
	mkdir -p `dirname staging/$f`
	cp $f staging/$f
done

web-ext build -s staging
