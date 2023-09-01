(async () => {

  const extensionRoot = document.createElement('div');
  extensionRoot.id = 'linkBeamExtensionRoot';
  document.body.appendChild(extensionRoot);

  const src = chrome.runtime.getURL("/assets/web_ui.js");
  await import(src);
  
})();