import Vue from 'vue';
import App from './App.vue';
import VueRouter from 'vue-router';
import router from './router';
import VModal from 'vue-js-modal';
import Vue2TouchEvents from 'vue2-touch-events';

Vue.use(Vue2TouchEvents);
Vue.use(VModal);

Vue.use(VueRouter);
Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
