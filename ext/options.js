'use strict';

const webext = typeof browser === 'undefined' ? chrome : browser;
if (webext === chrome) {
	document.querySelectorAll('.browser_name').forEach(span => { span.innerText = "Google" });
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

document.querySelectorAll('input, select').forEach(function setupPrefElement(elt) {
	// Each setting key in sync storage matches the name attribute of its element,
	// and plugins are grouped together under the ”plugins” key.
	const prefName = elt.getAttribute('name');
	if (!prefName) {
		return;
	}

	const isBoolPref = (elt.tagName === 'INPUT' && elt.type === 'checkbox');
	const setter = isBoolPref ? (val => { elt.checked = val; }) : (val => { elt.value = val; });
	const getter = isBoolPref ? (() => elt.checked) : (() => elt.value );

	if (elt.parentNode.classList.contains('plugins')) {
		webext.storage.sync.get({ plugins: {} }).then(({ plugins }) => {
			if (prefName in plugins) {
				setter(plugins[prefName]);
			}
		});

		elt.onchange = () => {
			webext.storage.sync.get({ plugins: {} }).then(({ plugins }) =>
				Object.assign(plugins, {[prefName]: getter()})
			).then(plugins => {
				webext.storage.sync.set({ plugins })
			});
		};
	} else {
		webext.storage.sync.get(prefName).then(storage => {
			if (prefName in storage) {
				setter(storage[prefName]);
			}
		});

		elt.onchange = () => {
			webext.storage.sync.set({[prefName]: getter()})
		};
	}
});
