const saveBtn = document.getElementById('save');
const enabledCheckbox = document.getElementById('enabled');
const fullCheckbox = document.getElementById('full');

const saveSettings = () => {
  const settings = {
    proxyEnabled: enabledCheckbox.checked,
    proxyFullEnabled: fullCheckbox.checked,
    proxyHost: document.getElementById('host').value.trim(),
    proxyPort: document.getElementById('port').value.trim(),
    proxyUser: document.getElementById('user').value.trim(),
    proxyPass: document.getElementById('pass').value.trim(),
    sites: document.getElementById('sites').value.split(',').map(s => s.trim()).filter(s => s),
  };  

  console.log(settings);
  

  chrome.storage.sync.set(settings, () => {
    saveBtn.textContent = 'Сохранено!';
    saveBtn.style.background = 'var(--success)';
    setTimeout(() => {
      saveBtn.textContent = 'Сохранить настройки';
      saveBtn.style.background = 'var(--btn)';
    }, 1000);
  });
};

// Сохраняем при нажатии на кнопку
saveBtn.addEventListener('click', saveSettings);

// Сохраняем мгновенно при переключении тумблера
enabledCheckbox.addEventListener('change', saveSettings);
fullCheckbox.addEventListener('change', saveSettings);

// Загрузка данных
chrome.storage.sync.get(['proxyHost', 'proxyPort', 'proxyUser', 'proxyPass', 'sites', 'proxyEnabled', 'proxyFullEnabled'], (data) => {
  enabledCheckbox.checked = !!data.proxyEnabled;
  fullCheckbox.checked = !!data.proxyFullEnabled;
  if (data.proxyHost) document.getElementById('host').value = data.proxyHost;
  if (data.proxyPort) document.getElementById('port').value = data.proxyPort;
  if (data.proxyUser) document.getElementById('user').value = data.proxyUser;
  if (data.proxyPass) document.getElementById('pass').value = data.proxyPass;
  if (data.sites) document.getElementById('sites').value = data.sites.join(', ');
});