import Vue from 'vue';
import App from './App.vue';
import VueRouter from 'vue-router';
import router from './router';
import Vue2TouchEvents from 'vue2-touch-events';
import 'viewerjs/dist/viewer.css';
import Viewer from 'v-viewer';
import VModal from 'vue-js-modal';
import VueResize from 'vue-resize'

Vue.use(VueResize);
Vue.use(VModal);
Vue.use(Viewer, {
  defaultOptions: {
    title: [true, (image) => {
      return image.alt;
    }],
    navbar: 3,
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

Vue.use(Vue2TouchEvents);
Vue.use(VueRouter);
Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
