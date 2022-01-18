const start = new Date().getTime();
const encoder = new TextEncoder();
const readable = new ReadableStream({
  async pull(c) {
    c.enqueue(encoder.encode(start));
    await new Promise((resolve) => setTimeout(resolve, 15000));
  },
});

self.addEventListener('message', (event) => {
  console.log(event.data);
});

self.addEventListener('install', (event) => {
  console.log(event);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log(event);
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', async (event) => {
  console.log(event);
  if (event.request.url.includes('stream')) {
    event.respondWith(
      new Response(readable, {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/octet-stream' },
      })
    );
    console.log(readable);
  }
});
