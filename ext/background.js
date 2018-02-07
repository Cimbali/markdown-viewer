const md_extension_pattern = /\.m(arkdown|kdn?|d(o?wn)?)$/i;

// Support loading additional scripts on demand by content script.
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.scriptToInject) {
		browser.tabs.executeScript(sender.tab.id, { file: message.scriptToInject }, () => {
			sendResponse({ success: true });
		});
		return true;
	}
	return false;
});

// Enable/disable requesting permissions
function setButton(tab, permsGiven) {
	var url = new URL(tab.url);
	var name = url.protocol == 'file:' ? 'local files' : url.host;

	if (permsGiven) {
		browser.browserAction.setTitle({tabId: tab.id, title: 'Markdown rendering already activated for '+ name});
		browser.browserAction.disable(tab.id);
	} else  {
		browser.browserAction.setTitle({tabId: tab.id, title: 'Enable Markdown rendering for '+ name});
		browser.browserAction.enable(tab.id);
	}
}

browser.tabs.query({}).then(tabs => tabs.forEach(tab => {
	browser.permissions.contains({origins: [tab.url]}).then(allowed => setButton(tab, allowed))
}));

// Make button request permission for current domain
browser.browserAction.onClicked.addListener(activeTab => {
	var url = new URL(activeTab.url);
	var perm = {origins: []};
	if (url.protocol == 'file:') {
		perm.origins.push('file:///*');
	} else if (url.href == 'about:addons') {
		// From configuration page means enable everywhere, as permissions.request() can't be called from there
		perm.origins.push('*://*/*');
		perm.origins.push('file:///*');
	} else {
		perm.origins.push('*://' + url.host + '/*');
	}

	browser.permissions.request(perm).then(allowed => {
		browser.runtime.sendMessage({requested: perm.origins, granted: allowed});
		if (allowed && md_extension_pattern.test(url.pathname)) {
			browser.tabs.executeScript(activeTab.id, { file: '/ext/content.js' });
		}
		setButton(activeTab, allowed);
	});
});

browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
	if ('status' in changeInfo && changeInfo.status === 'complete') {
		// check permissions, maybe inject our code, and update button
		browser.permissions.contains({origins: [tab.url]}).then(allowed => {
			var url = new URL(tab.url);
			if (allowed && md_extension_pattern.test(url.pathname)) {
				browser.tabs.executeScript(id, { file: '/ext/content.js' });
			}
			setButton(tab, allowed);
		});
	}
});
