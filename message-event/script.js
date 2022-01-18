const sw = await navigator.serviceWorker.register(
  'sw.js?=' + new Date().getTime(),
  {
    scope: './',
  }
);
navigator.serviceWorker.onmessage = async (event) => {
  document.querySelector('pre').textContent = JSON.stringify(event.data, null, 2, null, 2);
  await new Promise((resolve) => setTimeout(resolve, 15000));
  event.source.postMessage(null);
};
(await navigator.serviceWorker.ready).active.postMessage(null);
