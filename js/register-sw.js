// Register service worker only if supported
if (navigator.serviceWorker) {
  navigator.serviceWorker.register('/sw.js').then(function(reg) {
    console.log("Service Worker Registered");
  }).catch((e) => {
    console.log("Couldn't register service worker... \n", e);
  });
}
