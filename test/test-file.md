# Title 1
## Title 2
### Title 3
#### Title 4
##### Title 5
###### Title 6

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Unicode: éè

**bold**

*italic*

~~strike~~

multipe_underscores_in_text_without_parsing

* item 1
* item 2
* item 3

1. item 1
2. item 2
3. item 3

| Header | Header | Header |
|--------|--------|--------|
| Cell   | Cell   | Cell   |
| Cell   | Cell   | Cell   |
| Cell   | Cell   | Cell   |

| Left-Aligned  | Center Aligned  | Right Aligned |
| :------------ |:---------------:| -----:|
| col 3 is      | some wordy text | $1600 |
| col 2 is      | centered        |   $12 |
| zebra stripes | are neat        |    $1 |

https://addons.mozilla.org/fr/firefox/addon/markdown-viewer/

[link (markdown-viewer on AMO)](https://addons.mozilla.org/fr/firefox/addon/markdown-viewer/)

[relative link](hello-world.md)

[relative link to subdir](sub/hello-sub.md)

```js
// Some Javascript code
function myFunction() {
	console.log("Hello World!");
}
```

![Small image](http://lorempixel.com/400/200/)

![Large image (should be resized)](http://lorempixel.com/1200/200/)

<strong onload="console.log('loaded')">HTML is allowed</strong>

<strong onclick="alert('XSS')">But scripts (into script tags ot inline) aren't</strong>

<button onclick="alert('XSS KLR')">meep</button>

<script type="text/javascript">console.log('XSS KLR');</script>
