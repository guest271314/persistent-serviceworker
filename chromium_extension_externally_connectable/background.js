const start = new Date();

async function persistentExternalConnection(id) {
  if (!self.externalPort) {
    function handleMessage(e) {
      console.log(e);
    }
    function handleDisconnect(resolve) {
      self.externalPort.onMessage.removeListener(handleMessage);
      self.externalPort.onDisconnect.removeListener(handleDisconnect);
      self.externalPort = null;
      resolve();
    }
    async function* active(id) {
      while (true) {
        yield new Promise((resolve) => {
          self.externalPort = chrome.runtime.connect(id, {
            name: 'active',
          });
          self.externalPort.onMessage.addListener(handleMessage);
          self.externalPort.onDisconnect.addListener(
            handleDisconnect.bind(null, resolve)
          );
        });
      }
    }
    async function stream() {
      for await (const _ of active(id)) {
      }
    }
    stream();
  } else {
    self.externalPort.disconnect();
    self.externalPort = null;
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  // TODO: Dynamically update "externally_connectable" in manifest.json
  chrome.scripting.executeScript({
    target: {
      tabId: tab.id,
    },
    world: 'MAIN',
    args: [chrome.runtime.id],
    func: persistentExternalConnection,
  });
});

let port;

async function handleConnectExternal(_) {
  port = _;
  const time = new Date();

  function handleMessage(e) {
    console.log(e);
  }
  function handleDisconnect(e) {
    console.log(e);
    port.onMessage.removeListener(handleMessage);
    port.onDisconnect.removeListener(handleDisconnect);
    port = null;
  }

  port.onMessage.addListener(handleMessage);
  port.onDisconnect.addListener(handleDisconnect);

  while (port && (new Date() - time) / 60000 < 1) {
    if (port) {
      const now = new Date();
      port.postMessage({
        start,
        now,
        time,
        active: (new Date() - time) / 60000 < 1,
        minutes: (now - start) / 60000,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
    } else {
      break;
    }
  }

  if (port) {
    const now = new Date();
    port.postMessage({
      start,
      now,
      time,
      active: (new Date() - time) / 60000 < 1,
      minutes: (now - start) / 60000,
    });
    port.disconnect();
    port.onMessage.removeListener(handleMessage);
    port.onDisconnect.removeListener(handleDisconnect);
    port = null;
  }
}

chrome.runtime.onConnectExternal.addListener(handleConnectExternal);
