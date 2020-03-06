
<template>
  <div id="app" >
    <Navbar  @login="login" :mobile="mobile" :user="user"></Navbar>
    <div id="content">
      <router-view :user="user"></router-view>
    </div>
  </div>
</template>
<script>
  import Navbar from './components/Navbar.vue'
  import axios from "axios";
  import * as env from "./assets/env.js";

  export default {
    name: 'App',
    data: () => {
      return {
        user: null,
        mobile: false
      }
    },
    components: {
      Navbar
    },
    methods: {
      login ({user}) {
        this.user = user;
        localStorage.setItem('token', user.token);
        window.location.reload();
      }
    },
    created() {
      const token = localStorage.getItem('token');
      if(window.innerWidth < 700)
        this.mobile = true;
      axios.post(env.backend_url + '/check_token', {token})
              .then(({data}) => {
                if(data)
                  this.user = data;
              })
    }
  }
</script>
<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }
  #content {
    padding-top: 20px;
  }
  .bg-info, .btn-info, .badge-primary{
    background-color: #2A7118!important;
    color: white!important;
  }
  .text-light{
    color: white!important;
  }
  li > p:first-child {
    display: inline;
  }
</style>