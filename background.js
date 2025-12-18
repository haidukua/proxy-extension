function updateBadge(enabled, fullMode) {
  let text = 'OFF';
  let color = '#6c757d';
  if (enabled) {
    text = fullMode ? 'ALL' : 'ON';
    color = fullMode ? '#9b71f7cd' : '#28a745';
  }
  chrome.action.setBadgeText({ text: text });
  chrome.action.setBadgeBackgroundColor({ color: color });
}

function updateProxy() {
  chrome.storage.sync.get(['proxyHost', 'proxyPort', 'sites', 'proxyEnabled', 'proxyFullEnabled'], (data) => {
    const { proxyHost, proxyPort, sites, proxyEnabled, proxyFullEnabled } = data;

    if (!proxyEnabled || !proxyHost || !proxyPort) {
      chrome.proxy.settings.clear({ scope: 'regular' });
      updateBadge(false, proxyFullEnabled);
      return;
    }

    let pacScriptData = "";

    if (proxyFullEnabled) {
      // Режим "Всё через прокси"
      pacScriptData = `
        function FindProxyForURL(url, host) {
          return "PROXY ${proxyHost}:${proxyPort}";
        }
      `;
    } else {
      // Режим "Только список"
      const sitesCondition = (sites && sites.length > 0) 
        ? sites.map(site => `shExpMatch(host, "*${site}*")`).join(' || ')
        : "false";

      pacScriptData = `
        function FindProxyForURL(url, host) {
          if (${sitesCondition}) {
            return "PROXY ${proxyHost}:${proxyPort}";
          }
          return "DIRECT";
        }
      `;
    }

    const config = {
      mode: "pac_script",
      pacScript: { data: pacScriptData }
    };

    chrome.proxy.settings.set({ value: config, scope: 'regular' }, () => {
      updateBadge(true, proxyFullEnabled);
    });
  });
}

// Слушатели (остаются прежними)
chrome.webRequest.onAuthRequired.addListener(
  (details) => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['proxyUser', 'proxyPass', 'proxyEnabled'], (data) => {
        if (data.proxyEnabled && data.proxyUser && data.proxyPass && details.isProxy) {
          resolve({ authCredentials: { username: data.proxyUser, password: data.proxyPass } });
        } else { resolve({}); }
      });
    });
  },
  { urls: ["<all_urls>"] },
  ["asyncBlocking"]
);

chrome.storage.onChanged.addListener(updateProxy);
chrome.runtime.onStartup.addListener(updateProxy);
chrome.runtime.onInstalled.addListener(updateProxy);