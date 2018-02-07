function list_permitted_origins(perm) {
	var list = document.getElementById('origins');

	while (list.hasChildNodes()) {
		list.removeChild(list.lastChild);
	}

	var origins = perm.origins.filter(orig => !orig.startsWith('moz-extension://'));

	if (!origins.length) {
		list.appendChild(document.createElement('li')).textContent = 'No domains to be shown';
		return;
	}

	origins.forEach(orig => {
		var btn = document.createElement('button');

		if (orig === '*://*/*')
			btn.textContent = 'ALL web sites !';
		else if (orig.startsWith('file://'))
			btn.textContent = 'local files';
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

// list when opening, and refresh page whenever permissions are added
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
