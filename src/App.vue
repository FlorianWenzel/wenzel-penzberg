<template>
  <div id="app" >
    <Navbar  @login="login" v-bind:user="user"></Navbar>
    <router-view></router-view>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'

export default {
  name: 'App',
  data: () => {
    return {
      user: null,
    }
  },
  components: {
    Navbar
  },
  methods: {
    login ({user}) {
      this.user = user;
    }
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
  margin-top: 60px;
}
</style>
