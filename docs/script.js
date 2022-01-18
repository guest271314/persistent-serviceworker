navigator.serviceWorker.addEventListener('controllerchange', (e) => {
  console.log(e.type);
  es = new EventSource('./?persistentServiceWorker');
  es.addEventListener('persistentServiceWorker', (e) => {
    const { lastEventId } = e;
    document.querySelector('data').textContent = JSON.stringify(
      { lastEventId, ...JSON.parse(e.data) },
      null,
      2
    );
  });
  es.addEventListener('open', (e) => {
    // console.log(e.type);
  });
  es.addEventListener('error', (e) => {
    // console.log(e);
  });
});
const sw = await navigator.serviceWorker.register('sw.js?=' + new Date().getTime(), {
  scope: './',
});
let es;
