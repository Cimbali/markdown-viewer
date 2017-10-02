#!/bin/sh
rm -r staging 2>/dev/null
rm -r web-ext-artifacts 2>/dev/null
for f in LICENSE \
	manifest.json \
	ext/* \
	ib/highlightjs/styles/default.css \
	lib/sss/sss.css \
	lib/sss/sss.print.css
do
	mkdir -p `dirname staging/$f`
	cp $f staging/$f
done

browserify ./ext/content.js\
 -r ./lib/markdown-it/dist/markdown-it.min.js:markdown-it\
 -r ./lib/markdown-it-checkbox/dist/markdown-it-checkbox.min.js:markdown-it-checkbox\
 -r ./lib/highlightjs/highlight.pack.min.js:highlight.js\
 -o ./staging/ext/content.js

web-ext build -s staging
