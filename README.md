# markdown-viewer

Markdown (.md file) Viewer extension.
Displays markdown documents beautified in your browser.

Markdown is a lightweight markup language which uses plain text to describe formatting information, such as `# Heading`, `1. numbered lists`, `**bold**`, etc.
This add-on identifies markdown documents by the extension in the URL (one of .markdown, .md, .mdown, .mdwn, .mkd, .mkdn).
When you navigate to a markdown document, if the content is plain text, not already styled (by GitHub for example), this add-on formats
it into HTML (with headings, ordered lists, bold text, etc.) using markup from the document and displays it directly in your browser.

This add-on was initially a XUL/XPCOM addon by [@Thiht](https://github.com/Thiht/markdown-viewer), rewritten for the [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions) by [@KeithLRobertson](https://github.com/KeithLRobertson).

## Unicode Characters

So, non-ASCII characters in your document aren't displaying correctly? Special characters like " **á** " appear as " **Ã¡** "?
This is a problem of character encoding, which concerns converting a file (a sequence of octets) into text (a sequence of characters) and back.
By the time Firefox activates the Markdown Viewer Web Extension for your document, the file is already converted into text, correctly or incorrectly.
If the file begins with a Byte Order Marker (BOM), a pseudo-character which tells how the file is encoded, then Firefox will see it and use that encoding.
Otherwise, Firefox may have decoded the file with the wrong encoding.
Although UTF-8 is the modern _de facto_ standard encoding, Firefox defaults to using your system's regional encoding, yielding incorrect results.

Some extensions have worked around this by re-loading the file and explicitly decoding it as UTF-8, but it is a pain to do so.
Plus, this extension is intended to be a light and simple wrapper around the markdown-to-HTML converter, markdown-it.

When the markdown document is obtained from a web site, the site should return a Content-Type header which specifies the encoding.
If it does not and the file lacks a BOM, you're out of luck. Contact the web site owner.

When the markdown is loaded from a local file, there are no HTML headers to lean on.
Fortunately, Firefox now has a setting which allows specifying that you want to use UTF-8 for local files without a BOM.
Go to about:config, search for `intl.charset.fallback.utf8_for_file`, and set its value to `true`. It should look better now.

## Viewing Original Markdown

To keep it simple, the extension does not support on and off states.
If the document has one of the supported extensions, it should convert.
Some web sites however, like raw.githubusercontent.com, return CORS headers, in which case Firefox will not inject this extension's content scripts, so it cannot convert the document.
On those pages, the extension will display a button in your address bar, and when clicked, take you to a page that can render the document.

If you're viewing pretty markdown and you want to see the original source text, right-click and select "View Page Source".
On the extension rendering page, you can instead open the drop-down menu on the page and click “View Source”.
(Make sure you don't have any text selected to see that option.)
Of course, you can also (Ctrl-S) save the document to a file and open it in any text editor.

## Saving Converted Markdown

If you would like to save the HTML-converted text, it is possible to do so in the desktop versions of Firefox.
* Open the drop-down menu on the page
* Select “Download HTML”

## Custom Appearance

You don't like how the styled markdown looks?
There are currently 2 default styles to choose from (not from this repo − under MIT):
- [SSS (Simple Style Sheet)](https://github.com/Thiht/sss)
- [github markdown css](https://github.com/sindresorhus/github-markdown-css)

There are also a number of [highlight.js](https://github.com/highlightjs/highlight.js) styles to choose from.
Styles ending in `auto` will automatically pick the `dark` and `light` variant based on the `prefers-color-scheme` value of your browser.

Using CSS, you can further customize the appearance any way you like it.
View Add-ons (about:addons), and click Options for the Markdown Viewer.
There is a box to enter your Custom CSS text. (Sorry, there is not currently a "user-friendly" drop-down option.)
As the instructions there state, click or tab out of the text box to save your changes.
The CSS is not validated, so you may want to create your CSS outside the options page (or lift it from a site that you like), and paste it in.
If you have entered some changes that you don't want to keep, refresh the options page to discard changes.

For example to assign a maximum width root element in the styled markdown:

```css
.markdownRoot {
    margin: 0 auto;
    max-width: 888px;
    padding: 45px;
    border: lightgrey thin solid;
}
```

## "Can You Add This Feature?"

This is an open-source project with the most liberal usage and change license there is.
Please feel free to modify it to meet your needs, and to contribute your improvement back to the community.

Think only experts can do that?
Although [Keith](https://github.com/KeithLRobertson) is a programmer, he could only just make his way around JavaScript, and was a total beginner with the WebExtension browser plugin API.
But Keith needed a markdown viewer, and the plugin API which the existing add-on had used was deprecated and removed, so he adapted that add-on to the new technology.

The feature set is expected to grow, not from a single author, but by the contributions of users like you who need some additional capabilities.
Several features have been added by community contributors who needed them, which include:

* checkbox support, by [@RaffaeleMorganti](https://github.com/RaffaeleMorganti)
* overriding CSP headers (and secure rendering) by [@KOLANICH](https://github.com/KOLANICH)
* anchored headers
* reload maintaining scroll location
* custom CSS
* many documentation fixes by various authors

Many thanks to them and to our future contributors. Pull requests are welcomed.

## To Build The Extension

* Required:
	* [nodejs](https://nodejs.org/) with npm or preferably yarn
	* [web-ext](https://github.com/mozilla/web-ext/) (npm install -g web-ext)
* Clone the repo:
	```sh
	git clone https://github.com/Cimbali/markdown-viewer.git
	cd markdown-viewer
	```
* Get all pre-built javascript dependencies:
	```sh
	yarn install
	```
* Build katex from source (to avoid issues with fonts)
	```sh
	git submodule update --init
	cd srclib/katex
	yarn install

	export USE_TTF=false
	export USE_WOFF=false
	export USE_WOFF2=false
	yarn build
	cd ../..
	```

## To Test The Extension

Firefox won't install the generated `.zip` file permanently until it's signed by Mozilla.
You can test any changes using the cloned project files.

Before that you’ll need to build katex from source (see [above](#to-build-the-extension)).

* In a command prompt, navigate to the project root folder (containing the `manifest.json`) and run `web-ext run`.
* Or to install the extension [temporarily in Firefox](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Temporary_Installation_in_Firefox):
  * First, uninstall this add-on if you have it already
  * Navigate to "about:debugging"
  * Click "Load Temporary Add-on"
  * Navigate to the project root folder and open the `manifest.json` file.

## Support for local files on Linux and macOS

Firefox may not know how to handle markdown files by default (see #2), and if opening them it may suggest to download them instead, so that you may be unable to either automatically render them or access the address bar (“page action”) button. Until Firefox [implements mime-type handling for extensions](https://bugzilla.mozilla.org/show_bug.cgi?id=1457500), there are a number of possible workarounds for this. Here are the 3 options that work the best:

1) Open the page via the extension’s rendering page (since v2):

   The best way to do this is to go to `ext+view-markdown:file:///path/to/file.md`. (Note that you can do this also for online pages.)
   Firefox then requires us to have you confirm file access, through a file picker or drag-and-drop.

   Opening a file this way allows to both:
   - have a 1-click copy of the file path, that you can quickly copy directly into the file picker,
   - have Markdown Viewer remember the file path, e.g. when closing and reopening the tab, so you can see the same prompt again.

   Alternately, you can open the file prompt without providing the path, by clicking the “*Open local markdown file*” button in your toolbar or overflow menu or navigating to `ext+view-markdown:` in your address bar. Markdown Viewer will now never be aware of the actual path to the file.

2) Edit Firefox’s private mime types.

   These mime types are stored in a file indicated by `helpers.private_mime_types_file`, by default it is `~/.mime.types`.
   Create this file if it does not exist, otherwise edit it, and add the following line:

   ```
   type=text/plain exts=md,mkd,mkdn,mdwn,mdown,markdown, desc="Markdown document"
   ```

   Then restart firefox.

   ---
   **Important note:** On some systems, e.g. Ubuntu 21.10 or newer, firefox may be installed with a system like [snap](https://ubuntu.com/core/docs/snaps-in-ubuntu-core), which prevents it from reading files from your disk such as `~/.mime.types`, see [#86](https://github.com/Cimbali/markdown-viewer/issues/86).

   In that case you need to:
   - use a directory accessible to firefox, and
   - expand the `~` to the full path of your home

   E.g. use as filename and config value: `/home/<me>/snap/firefox/common/mime.types` − where `<me>` is your username.
   A suitable directory is likely the parent of `.mozilla` in your profile path, which you can find in `about:profiles`.

   ---

3) On Linux only, a workaround is to define the MIME type of markdown file extensions as `text/plain`.

   Add the following XML to `~/.local/share/mime/packages/text-markdown.xml`:
   ```XML
   <?xml version="1.0"?>
   <mime-info xmlns='http://www.freedesktop.org/standards/shared-mime-info'>
     <mime-type type="text/plain">
       <glob pattern="*.md"/>
       <glob pattern="*.mkd"/>
       <glob pattern="*.mkdn"/>
       <glob pattern="*.mdwn"/>
       <glob pattern="*.mdown"/>
       <glob pattern="*.markdown"/>
     </mime-type>
   </mime-info>
   ```

   Then run
   ```bash
   $ update-mime-database ~/.local/share/mime
   ```

   See [this SuperUser question](https://superuser.com/questions/696361/how-to-get-the-markdown-viewer-addon-of-firefox-to-work-on-linux) for further reading on the topic.
