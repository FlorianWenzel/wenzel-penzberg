import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import router from './router'
import Vue2TouchEvents from 'vue2-touch-events';
import 'viewerjs/dist/viewer.css'
import Viewer from 'v-viewer'

Vue.use(Viewer, {
  defaultOptions: {
    title: false,
    navbar: 3,
    toolbar: {
      reset: 3,
      zoomIn: 3,
      oneToOne: false,
      prev: true,
      play: {
        show: true,
        size: 'large',
      },
      next: true,
      zoomOut: 3,
      rotateLeft: 3,
      rotateRight: false,
      flipHorizontal: false,
      flipVertical: false,
    }
  }
});

Vue.use(Vue2TouchEvents);
Vue.use(VueRouter);
Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
