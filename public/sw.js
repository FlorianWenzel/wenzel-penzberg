importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}
workbox.routing.registerRoute(
    /\/image\//,
    new workbox.strategies.StaleWhileRevalidate({
      "cacheName": "images",
      puglins: [
        new workbox.expiration.Plugin({
          maxEntries: 50,
          maxAgeSecounds: 31556952
        })
      ]
    }))
workbox.routing.registerRoute(
    /\//,
    new workbox.strategies.StaleWhileRevalidate({
      "cacheName": "assets",
      puglins: [
        new workbox.expiration.Plugin({
          maxEntries: 50,
          maxAgeSecounds: 31556952
        })
      ]
    }))
