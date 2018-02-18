const md_extension_pattern = /\.m(arkdown|kdn?|d(o?wn)?)$/i;

// Support loading additional scripts on demand by content script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.scriptToInject) {
		browser.tabs.executeScript(sender.tab.id, { file: message.scriptToInject }, () => {
			sendResponse({ success: true });
		});
		return true;
	}
	return false;
});

function origin(url, setting) {
	var origins = []
	// Return the correct origin string based on the URL object and whether we set or get permissions
	if (url.protocol == 'about:' && url.pathname == 'addons') {
		// From configuration page means enable everywhere, as permissions.request() can't be called from there
		origins.push('*://*/*');
		if (setting) origins.push('file:///*');
	} else if (url.protocol == 'about:') {
		return;
	} else if (url.protocol == 'file:') {
		origins.push('file:///*');
	} else if (setting) {
		origins.push('*://' + url.host + '/*');
	} else {
		origins.push(url.href);
	}

	return origins;
}

// Enable/disable requesting permissions
function setButton(url, tabId, disable) {
	var tooltip = {tabId: tabId, title: disable ? 'Markdown rendering already activated' : 'Enable Markdown rendering'};

	if (url.protocol == 'about:' && url.pathname == 'addons') {
		tooltip.title += ' for ALL web sites';
	} else if (url.protocol == 'about:') {
		tooltip.title = 'Markdown can not be rendered on "about:" pages'; disable = true;
	} else if (!md_extension_pattern.test(url.pathname)) {
		tooltip.title = 'Not a Markdown file'; disable = true;
	} else if (url.protocol == 'file:') {
		tooltip.title += ' for local files';
	} else {
		tooltip.title += ' for ' + url.host;
	}

	browser.browserAction.setTitle(tooltip);

	if (disable) {
		browser.browserAction.disable(tabId);
	} else  {
		browser.browserAction.enable(tabId);
	}
}

function check_inject(tab, ask) {
	var url = new URL(tab.url);
	var perm = {origins: origin(url, ask)};
	var promise;

	if (ask) {
		promise = browser.permissions.request(perm).then(allowed => {
			browser.runtime.sendMessage({requested: perm.origins, granted: allowed});
			return allowed;
		});
	} else {
		promise = browser.permissions.contains(perm);
	}

	promise.then(allowed => {
		if (allowed && md_extension_pattern.test(url.pathname)) {
			browser.tabs.executeScript(tab.id, { file: '/ext/content.js' });
		}
		setButton(url, tab.id, allowed);
	});
}

// Initial setup for all tabs
browser.tabs.query({}).then(tabs => tabs.forEach(tab => {
	var url = new URL(tab.url);
	var origins = origin(url);

	if (!origins.length) {
		// No origins => rendering markdown is not applicable here
		setButton(url, tab.id, true);
	}

	browser.permissions.contains({origins: origins}).then(allowed => setButton(url, tab.id, allowed))
}));

// Make button request permission for current domain
browser.browserAction.onClicked.addListener(activeTab => check_inject(activeTab, true));

// Auto check (& inject) for pages when loading is complete
browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
	if ('status' in changeInfo && changeInfo.status === 'complete') {
		check_inject(tab, false);
	}
});
