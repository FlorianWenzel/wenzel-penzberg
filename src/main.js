import Vue from 'vue';
import App from './App.vue';
import VueRouter from 'vue-router';
import router from './router';
import 'viewerjs/dist/viewer.css';
import Viewer from 'v-viewer';
import VModal from 'vue-js-modal';
import 'lightgallery.js';
import 'lightgallery.js/dist/css/lightgallery.css';
import 'lg-autoplay.js';
import 'lg-fullscreen.js';
import 'lg-zoom.js';

Vue.use(VModal);
Vue.use(Viewer, {
  defaultOptions: {
    title: [true, (image) => {
      return image.alt;
    }],
    loop: false,
    navbar: false,
    tooltip: false,
    toolbar: {
      reset: 3,
      zoomIn: 3,
      oneToOne: false,
      prev: true,
      play: true,
      next: true,
      zoomOut: 3,
      rotateLeft: 3,
      rotateRight: false,
      flipHorizontal: false,
      flipVertical: false,
    },
    backdrop: false,
  }
});

Vue.use(VueRouter);
Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
