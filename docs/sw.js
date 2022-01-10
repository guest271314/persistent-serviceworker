const start = new Date();
let id = 0;
self.addEventListener('install', (event) => {
  console.log(event.type);
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', async (event) => {
  console.log(event.type);
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', async (event) => {
  if (event.request.url.includes('persistentServiceWorker')) {
    const now = new Date();
    const message = `event: persistentServiceWorker\nretry: 15000\nid: ${id++}\ndata:{"start":"${start}","now": "${now}", "minutes":"${
      (now - start) / 60000
    }"}\n\n`;
    const blob = new Blob([message], { type: 'text/event-stream' });
    event.respondWith(
      new Response(blob, {
        headers: { 'Content-Type': 'text/event-stream' },
      })
    );
  }
});
