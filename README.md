# markdown-viewer
Markdown (.md) file viewer [WebExtension](https://developer.mozilla.org/en-US/Add-ons/WebExtensions) for your browser.

## Build
* Required:
	* [nodejs](https://nodejs.org/) with npm
	* [web-ext](https://github.com/mozilla/web-ext/) (npm install -g web-ext)
	* [browserify](https://github.com/browserify/browserify/) (npm install -g browserify)
* Run `build.bat` (Windows) or `build.sh` (Linux)

## Test
* (Firefox won't install the generated .zip unless it's signed by Mozilla; you can test from the staging folder.)
* Navigate to the staging folder and run `web-ext run`.
* Or install `staging/manifest.json` [temporarily in Firefox](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Temporary_Installation_in_Firefox).