async function persistServiceWorker(src) {
  return new Promise((resolve) => {
    const removeFrames = (close = false) => {
      for (const frame of document.querySelectorAll(
        `[src="${src}index.html"]`
      )) {
        frame.parentNode.removeChild(frame);
      }
      if (close) {
        port.postMessage('close');
      }
    };
    removeFrames();
    onbeforeunload = (e) => {
      removeFrames(true);
    };
    onmessage = async (e) => {
      if (e.origin === new URL(src).origin) {
        console.log(e);
        if (e.ports.length) {
          [port] = e.ports;
          port.onmessage = (e) => {
            console.log(e.data);
          };
          port.onmessageerror = (e) => {
            console.error(e);
          };
          if (iframe.parentNode) {
            // TODO: remove iframe when port is defined
            // iframe.parentNode.removeChild(iframe);
          }
          while (port) {
            port.postMessage(null);
            await new Promise((r) => setTimeout(r, 1000 * 5));
          }
        } else if (e.data === 'close') {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
            onmessage = null;
            port = null;
          }
        }
      }
    };

    iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.name = location.origin;
    document.body.appendChild(iframe);
    iframe.onload = () => resolve();
    iframe.src = `${src}index.html`;
  });
}

function persistentServiceWorkerActive(url) {
  alert(`Persistent ServiceWorker already running on ${url}`);
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!currentPersistentClient) {
    currentPersistentClient = tab.url;
    await chrome.scripting.executeScript({
      target: {
        tabId: tab.id,
      },
      world: 'MAIN',
      args: [chrome.runtime.getURL('')],
      func: persistServiceWorker,
    });
    (
      await self.clients.matchAll({ includeUncontrolled: true })
    )[0].postMessage(null, [port2]);
  } else {
    await chrome.scripting.executeScript({
      target: {
        tabId: tab.id,
      },
      world: 'MAIN',
      args: [currentPersistentClient],
      func: persistentServiceWorkerActive,
    });
  }
});

oninstall = async (event) => {
  console.log(event);
  event.waitUntil(self.skipWaiting());
};

onactivate = async (event) => {
  console.log(event);
  event.waitUntil(self.clients.claim());
};

onfetch = async (event) => {
  console.log(event);
};
// persistent data
const start = new Date();
let currentPersistentClient = null;
let lastEventId = 0;
// MessageChannel between external source and extension ServiceWorkerGlobalScope
let { port1, port2 } = new MessageChannel();
port1.onmessageerror = (err) => {
  console.error(err);
  currentPersistentClient = null;
  port1.close();
  chrome.runtime.reload();
};

port1.onmessage = async (e) => {
  if (e.data === 'close') {
    console.log(e);
    port1.close();
    chrome.runtime.reload();
  }
  if (e.data === 'port2') {
    port1.postMessage('port1');
    return;
  }
  port1.postMessage({
    lastEventId,
    start,
    now: new Date(),
    minutes: (new Date() - start) / 60000,
    message: `Message from ${e.target.constructor.name} in ${globalThis.constructor.name}`,
  });
  ++lastEventId;
};

onmessage = (e) => {
  if (e.data === 'close') {
    port1.close();
    chrome.runtime.reload();
  }
};
