
<template>
  <div id="app" >
    <Navbar  @login="login" :mobile="mobile" :online="online" :user="user"></Navbar>
    <div id="content">
      <Alert v-if="!online" :show="!online && showOfflineAlert" type="dark" html="Du bist offline, gecachte Bilder werden trotzdem angezeigt." @close="closeOfflineAlert" />
      <router-view :user="user" :online="online" @editPost="editPost" :postToEdit="postToEdit" :mobile="mobile"></router-view>
    </div>
  </div>
</template>
<script>
  import Swal from "sweetalert2";

  const VERSION = "1.0.0"
  import Navbar from './components/Navbar.vue'
  import Alert from './components/Alert.vue';
  import * as env from "./assets/env.js";
  import { post, reset } from "./assets/cache.js";

  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-info mr-1',
      cancelButton: 'btn btn-secondary'
    },
    buttonsStyling: false
  });
  export default {
    name: 'App',
    data: () => {
      return {
        user: null,
        mobile: false,
        online: true,
        postToEdit: null,
        showOfflineAlert: true,
      }
    },
    components: {
      Alert,
      Navbar
    },
    methods: {
      closeOfflineAlert(){
        this.showOfflineAlert = false;
      },
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
      },
      handleConnectionChange({type}){
        this.online = type === 'online';
      }
    },
    mounted(){
      window.addEventListener("resize", this.handleResize);
      window.addEventListener("online", this.handleConnectionChange)
      window.addEventListener("offline", this.handleConnectionChange)
    },
    created(){
      const token = localStorage.getItem('token');
      if(!navigator.onLine){
        this.online = false;
      }
      if(window.innerWidth < 700)
        this.mobile = true;
      post(env.backend_url + '/check_token', {token})
          .then(({data}) => {
            if(data)
              this.user = data;
          })
      post(env.backend_url + '/check_version', {version: VERSION})
          .then(({data}) => {
            if(data.update)
              swalWithBootstrapButtons.fire({
              html: "Neue Version herunterladen? <br> (empfohlen)",
              icon: "question",
              title: "Update verfügbar!",
              showCancelButton: true,
              cancelButtonText: "Nein",
              confirmButtonText: "Ja"
            })
            .then(({value})=>{
              if(value){
                reset()
                .then(() => {
                  location.reload(true);
                })
              }
            })
          })
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
    height: 100vh;
    width: 100vw;
  }
  body > .mainwrapper {
  }
  #content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    padding-top: 5rem;
    height: 100vh;
    background-color: white;
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
