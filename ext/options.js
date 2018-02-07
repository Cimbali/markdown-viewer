function list_permitted_origins(perm) {
	var list = document.getElementById('origins');

	while (list.hasChildNodes()) {
		list.removeChild(list.lastChild);
	}

	var origins = perm.origins.filter(orig => !orig.startsWith('moz-extension://'));

	if (!origins.length) {
		list.appendChild(document.createElement('li')).textContent = 'Click the Markdown Viewer toolbar button to enable Markdown rendering.';
		return;
	}

	origins.forEach(orig => {
		var btn = document.createElement('button');

		if (orig === '*://*/*')
			btn.textContent = 'ALL web sites !';
		else if (orig.startsWith('file://'))
			btn.textContent = 'Local Files';
		else
			btn.textContent = orig.split('/')[2];

		btn.onclick = () => {
			browser.permissions.remove({origins: [orig]}).then(removed => {
				if (removed) {
					list.removeChild(btn.parentNode);
				}
			});
		};

		list.appendChild(document.createElement('li')).appendChild(btn);
	});
}

// List permissions when opening options and refresh whenever permissions are added
browser.permissions.getAll().then(list_permitted_origins);
browser.runtime.onMessage.addListener(message => {
	if ('requested' in message && 'granted' in message) {
		if (message.granted) {
			browser.permissions.getAll().then(list_permitted_origins);
		}
		return true;
	}
	return false;
});

var timer = null;
var textarea = document.getElementById('custom_css');
function clear_saved_message() {
	if (timer != null) { window.clearTimeout(timer); timer = null; }
	textarea.onkeydown = null;
	document.getElementById('saved').style.display = 'none';
}

// Load custom CSS and save it when changed by user
browser.storage.sync.get('custom_css').then(storage => {
	if ('custom_css' in storage) { textarea.value = storage.custom_css; }

	textarea.onchange = () => {
		browser.storage.sync.set({custom_css: textarea.value}).then(() => {
			document.getElementById('saved').style.display = 'inline';
			timer = window.setTimeout(clear_saved_message, 8000);
			textarea.onkeydown = clear_saved_message;
		});
	};
});
