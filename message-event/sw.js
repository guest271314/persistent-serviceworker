let start = new Date();

self.addEventListener('install', (event) => {
  console.log(event);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', async (event) => {
  console.log(event);
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', async (event) => {
  console.log(event);
});

self.addEventListener('message', async (event) => {
  console.log(event);
  event.source.postMessage({
    start,
    now: new Date(),
    minutes: (new Date() - start) / 60000,
  });
});
