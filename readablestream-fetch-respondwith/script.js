try {
  const sw = await navigator.serviceWorker.register(
    'sw.js?=' + new Date().getTime(),
    {
      scope: './',
    }
  );

  await sw.ready;
  while (!(await navigator.serviceWorker.ready).active) {}
  await new Promise((resolve) => setTimeout(resolve, 100));
  (await fetch('./stream')).body.pipeThrough(new TextDecoderStream()).pipeTo(
    new WritableStream({
      write(value) {
        document.querySelector('data').textContent =
          (new Date() - value) / 60000;
      },
    })
  );
  /*
  // Firefox does not support pipeThrough() 
  // (or WritableStream() without setting in about:config),
  // throws 
  // Failed to load ‘’. A ServiceWorker intercepted the request and encountered an unexpected error. 
  // TypeError: Error in body stream
  const decoder = new TextDecoder();
  const reader = readable.getReader();
  while (true) {
    const {value, done} = await reader.read();
    if (done) {
      break;
    }
    document.querySelector('data')
    .textContent = (new Date() - decoder.decode(value)) / 60000;
  }       
  */
} catch (e) {
  console.error(e);
}
