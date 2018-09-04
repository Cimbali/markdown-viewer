const webext = typeof browser === 'undefined' ? chrome : browser;
if (webext === chrome) {
	document.getElementById('browser_name').innerText = "Google";
}

var timer = null;
var textarea = document.getElementById('custom_css');
function clear_saved_message() {
	if (timer != null) { window.clearTimeout(timer); timer = null; }
	textarea.onkeydown = null;
	document.getElementById('saved').style.display = 'none';
}

// Load custom CSS and save it when changed by user
webext.storage.sync.get('custom_css', (storage) => {
	if ('custom_css' in storage) { textarea.value = storage.custom_css; }

	textarea.onchange = () => {
		webext.storage.sync.set({custom_css: textarea.value}, () => {
			document.getElementById('saved').style.display = 'inline';
			timer = window.setTimeout(clear_saved_message, 8000);
			textarea.onkeydown = clear_saved_message;
		});
	};
});
