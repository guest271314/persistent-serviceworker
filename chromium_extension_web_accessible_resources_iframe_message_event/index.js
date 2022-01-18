function closeMessageChannel() {
  parent.postMessage('close', name);
}
navigator.serviceWorker.oncontrollerchange = async (e) => {
  console.log(e);
  closeMessageChannel();
};
navigator.serviceWorker.onmessage = async (e) => {
  parent.postMessage(e.data, name, e.ports);
  try {
    while ((await navigator.serviceWorker.ready).active) {
      (await navigator.serviceWorker.ready).active.postMessage(null);
      await new Promise((resolve) => setTimeout(resolve, 1000 * 15));
    }
    closeMessageChannel();
  } catch (err) {
    console.error(err);
    closeMessageChannel();
  }
};
console.log(chrome.runtime);
