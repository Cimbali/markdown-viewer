# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

Markdown Viewer Webext now supports local styles in a file _markdown.css alongside the .md files.
This is used here to format the top-level heading in bold blue text.

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Unicode: âêîôûŵŷ äëïöüẅÿ àèìòùẁỳ áéíóúẃý   Вот какой-то текст.

**bold**

*italic*

~~strikethrough~~

multiple_underscores_in_text_without_parsing

Let's try some :slightly_smiling_face: emoji :-) for your viewing :joy: pleasure.

Unordered lists with:
- asterisk
- dash
- or plus
- [ ] Can contain checkboxes, unchecked
- [X] or checked

Ordered lists:
1. start with numbers.
2. any number will do
3. if you like

| Left-Aligned  | Center Aligned  | Right Aligned |
| :------------ |:---------------:| -----:|
| col 1 is      | some wordy text | $1600 |
| col 2 is      | centered        |   $12 |
| zebra stripes | are neat        |    $1 |

[Link to Markdown Viewer (on AMO)](https://addons.mozilla.org/firefox/addon/markdown-viewer-webext/)

https://addons.mozilla.org/firefox/addon/markdown-viewer-webext/

[relative link](test-nobom.md)

[relative link to subdir](sub/hello-sub.md)

```js
// Some Javascript code
function myFunction() {
	console.log("Hello World!");
}
```

![Small image](http://lorempixel.com/400/200/)

![Large image (should be resized)](http://lorempixel.com/1200/200/)

<strong>HTML is supported</strong>

<strong onclick="alert('XSS')">But scripts (in script elements or from events) are not accepted</strong>

<button onclick="alert('XSS')" onload="console.log('loaded')">Therefore clicking me does nothing</button>

<script type="text/javascript">console.log('XSS');</script>

<a href=" JavaScript:alert('XSS')">JavaScript links are trampled out, too</a>

# Anchor links tests for #49

1. [متطلبات التشغيل الأولي](#متطلبات-التشغيل-الأولي)
2. [اكتشاف الكاميرات](#اكتشاف-الكاميرات)
3. [A test with à é ñ](#a-test-with-à-é-ñ)

## متطلبات التشغيل الأولي
* تجربة

## اكتشاف الكاميرات
* تجربة

## A test with à é ñ
* a test with à é ñ
