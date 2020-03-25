import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/nachrichten/',
    name: 'Nachrichten',
    component: () => import('../views/MessagesView.vue')
  },
  {
    path: '/neuer-beitrag/',
    name: 'Post',
    component: () => import('../views/PostView.vue')
  },
  {
    path: '/alben/*',
    name: 'Ablum',
    component: () => import('../views/AlbumsView.vue')
  },
  {
    path: '/account/',
    name: 'Account',
    component: () => import('../views/AccountView.vue')
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router
