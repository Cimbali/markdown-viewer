# markdown-viewer
Markdown (.md) file viewer [WebExtension](https://developer.mozilla.org/en-US/Add-ons/WebExtensions) for your browser.

## Build
* Run `build.bat` (Windows) or `build.sh` (Linux)
* Uses [web-ext](https://github.com/mozilla/web-ext/) which requires [nodejs](https://nodejs.org/) with npm.

Firefox won't install the generated .zip unless it's signed by Mozilla; you have to test from the staging folder.

## Testing
* Navigate to the staging folder and run `web-ext run`.
* Or install `staging/manifest.json` [temporarily in Firefox](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Temporary_Installation_in_Firefox).
