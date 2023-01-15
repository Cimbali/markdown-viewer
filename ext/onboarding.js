'use strict';

const { version } = webext.runtime.getManifest();
const update = new URLSearchParams(window.location.search).get('update');

const topTitle = document.getElementById('top');
topTitle.innerText += ` v${version}`
if (update) {
	document.querySelectorAll('.unchanged').forEach(node => { node.style.display = 'none' });
} else {
	document.querySelectorAll('.update').forEach(node => { node.style.display = 'none' });
}

document.getElementById('to-settings').onclick = () => webext.runtime.openOptionsPage();
