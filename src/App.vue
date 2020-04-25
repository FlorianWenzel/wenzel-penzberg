
<template>
  <div id="app" >
    <Navbar  @login="login" :mobile="mobile" :user="user"></Navbar>
    <div id="content">
      <router-view :user="user" @editPost="editPost" :postToEdit="postToEdit" :mobile="mobile"></router-view>
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
        mobile: false,
        postToEdit: null
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
      },
      editPost(post){
        this.postToEdit = post;
      },
      handleResize(){
        this.mobile = window.innerWidth < 700;
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
    },
    mounted(){
      window.addEventListener("resize", this.handleResize);
    }
  }
</script>
<style>
  html, body {
    background-color: #2a7118;
    position: fixed;
    overflow: hidden;
    height: 100vh;
    width: 100vw;
  }
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }
  body > .mainwrapper {
  }
  #content {
    padding-top: 20px;
    background-color: white;
    width: 100vw;
    height: 100vh;
    overflow-y: scroll;
  }
  .viewer-canvas{
    background: #363636;
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
