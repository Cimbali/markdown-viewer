#!/bin/sh
rm -r staging 2>/dev/null
rm -r web-ext-artifacts 2>/dev/null
for f in LICENSE \
	manifest.json \
	ext/* \
	lib/highlightjs/highlight.pack.min.js \
	lib/highlightjs/styles/default.css \
	lib/markdown-it/dist/markdown-it.min.js \
	lib/markdown-it-checkbox/dist/markdown-it-checkbox.min.js \
	lib/markdown-it-emoji/dist/markdown-it-emoji.min.js \
	lib/markdown-it-footnote/dist/markdown-it-footnote.min.js \
	lib/sss/sss.css \
	lib/sss/sss.print.css
do
	mkdir -p `dirname staging/$f`
	cp $f staging/$f
done

web-ext build -s staging
