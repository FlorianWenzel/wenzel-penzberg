importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}
workbox.routing.registerRoute(
    /\/image\//,
    new workbox.strategies.CacheFirst({
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
    new workbox.strategies.NetworkFirst({
      "cacheName": "assets",
      puglins: [
        new workbox.expiration.Plugin({
          maxEntries: 50,
          maxAgeSecounds: 31556952
        })
      ]
    }))
