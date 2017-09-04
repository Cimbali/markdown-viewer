
@rmdir /s /q staging 2>nul
@rmdir /s /q web-ext-artifacts 2>nul
@for %%f in (
	LICENSE
	manifest.json
	ext\*.*
	lib\highlightjs\LICENSE
	lib\highlightjs\highlight.pack.min.js
	lib\highlightjs\styles\default.css
	lib\markdown-it\LICENSE
	lib\markdown-it\dist\markdown-it.min.js
	lib\markdown-it-checkbox\LICENSE
	lib\markdown-it-checkbox\dist\markdown-it-checkbox.min.js
	lib\sss\LICENSE.md
	lib\sss\sss.css
	lib\sss\sss.print.css
) do @call :copyfile %%f staging\%%f

@web-ext build -s staging
@goto :EOF

:copyfile
@mkdir %~dp2 2>nul
@copy %1 %2 >nul
@exit /b
