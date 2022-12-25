'use strict';

const webext = typeof browser === 'undefined' ? chrome : browser;
if (webext === chrome) {
	document.getElementById('browser_name').innerText = "Google";
}

let timer = null;
const textarea = document.getElementById('custom_css');
function clearSavedMessage() {
	if (timer !== null) { window.clearTimeout(timer); timer = null; }
	textarea.onkeydown = null;
	document.getElementById('saved').style.display = 'none';
}

// Load custom CSS and save it when changed by user
webext.storage.sync.get({ custom_css: '' }).then(({custom_css: data}) => {
	textarea.value = data;

	textarea.onchange = () => {
		webext.storage.sync.set({custom_css: textarea.value}, () => {
			document.getElementById('saved').style.display = 'inline';
			timer = window.setTimeout(clearSavedMessage, 8000);
			textarea.onkeydown = clearSavedMessage;
		});
	};
});


const menuVisibility = document.getElementById('menu_visibility');
webext.storage.sync.get('display_menu').then(storage => {
	if ('display_menu' in storage) { menuVisibility.value = storage.display_menu; }

	menuVisibility.onchange = () => {
		webext.storage.sync.set({display_menu: menuVisibility.value})
	};
});


const embeddingMode = document.getElementById('iframe_embed');
webext.storage.sync.get('iframe_embed').then(storage => {
	if ('iframe_embed' in storage) { embeddingMode.checked = storage.iframe_embed; }

	embeddingMode.onchange = () => {
		webext.storage.sync.set({iframe_embed: embeddingMode.checked})
	};
});


webext.storage.sync.get('plugins').then(storage => {
	const pluginPrefs = storage.plugins || {};

	Object.keys(pluginPrefs).forEach(plugin => {
		document.querySelector(`input[name="${  plugin  }"]`).checked = pluginPrefs[plugin];
	});

	document.querySelectorAll('.plugins input').forEach(checkbox => {
		checkbox.onchange = () => {
			pluginPrefs[checkbox.getAttribute('name')] = checkbox.checked;
			webext.storage.sync.set({plugins: pluginPrefs});
		}
	});
});
