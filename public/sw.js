importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}
workbox.routing.registerRoute(
    /\.(?:js|css|html)$/,
    new workbox.strategies.StaleWhileRevalidate({
      "cacheName": "assets",
      puglins: [
        new workbox.expiration.Plugin({
          maxEntries: 50,
          maxAgeSecounds: 3650000
        })
      ]
    }))
workbox.routing.registerRoute(
    /\//,
    new workbox.strategies.StaleWhileRevalidate({
      "cacheName": "index",
      puglins: [
        new workbox.expiration.Plugin({
          maxEntries: 50,
          maxAgeSecounds: 3650000
        })
      ]
    }))
workbox.routing.registerRoute(
    /\.(?:png|gif|jpg|jpeg|webp|svg|mp4)$/,
    new workbox.strategies.CacheFirst({
      "cacheName": "images",
      puglins: [
        new workbox.expiration.Plugin({
          maxEntries: 50,
          maxAgeSecounds: 3650000
        })
      ]
    }))
