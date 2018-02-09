var textarea = document.getElementById('custom_css');
browser.storage.sync.get('custom_css').then(storage => {
	if ('custom_css' in storage)
		textarea.value = storage.custom_css;
}).then(() => {
	textarea.onchange = () => {
		browser.storage.sync.set({custom_css: textarea.value});
	};
});
