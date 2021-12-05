@cd lib\katex
npm install
set USE_TTF=false
set USE_WOFF=false
set USE_WOFF2=false
npm run build
@cd ..\..

@rmdir /s /q staging 2>nul
@rmdir /s /q web-ext-artifacts 2>nul
@for %%f in (
	LICENSE
	manifest.json
	ext\*.*
	lib\highlightjs\build\highlight.min.js
	lib\highlightjs\build\styles\*.min.css
	lib\markdown-it\dist\markdown-it.min.js
	lib\markdown-it-checkbox\dist\markdown-it-checkbox.min.js
	lib\markdown-it-emoji\dist\markdown-it-emoji.min.js
	lib\markdown-it-footnote\dist\markdown-it-footnote.min.js
	lib\markdown-it-fancy-lists\markdown-it-fancy-lists.js
	lib\markdown-it-texmath\texmath.js
	lib\markdown-it-texmath\css\texmath.css
	lib\katex\dist\katex.min.js
	lib\katex\dist\katex.min.css
	lib\sss\sss.css
	lib\sss\print.css
	lib\sss\github.css
) do @call :copyfile %%f staging\%%f

@call web-ext build -s staging
@goto :EOF

:copyfile
@mkdir %~dp2 2>nul
@copy %1 %2 >nul
@exit /b
