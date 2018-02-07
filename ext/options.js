function list_permitted_origins(perm) {
	var list = document.getElementById('origins');

	while (list.hasChildNodes()) {
		list.removeChild(list.lastChild);
	}

	var origins = perm.origins.filter(orig => !orig.startsWith('moz-extension://'));
	if (!origins.length)
		list.appendChild(document.createElement('li')).textContent = 'No domains to be shown';

	origins.forEach(orig => {
		var btn = document.createElement('button');
		btn.textContent = orig.startsWith('file://') ? 'local files' : orig.split('/')[2];
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

browser.permissions.getAll().then(list_permitted_origins);
