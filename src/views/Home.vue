<template>
  <div class="home" v-viewer>
      <Post :user="user" :post="post" :key="index" v-for="(post, index) of posts"></Post>
  </div>
</template>
<style scoped>
    .info {
        border-radius: 0 0 15px 15px;
    }

</style>
<style>
    .imagePopUp{
        min-width: 50vw;
        min-height: 50vw;
        max-height: 90vh;
        max-width: 90vw;
    }
</style>
<script>
import axios from 'axios';
import * as env from '../assets/env';
import Post from "../components/Post";
export default {
    name: 'Home',
    components: {Post},
    props: ["user"],
    data: function(){
        return {
            posts: [],
            allImages: []
        }
    },
    created() {
        const token = localStorage.getItem('token');
        axios.get(env.backend_url + '/posts?token=' + token)
        .then(({data}) => {
            this.posts = data;
        })
    }
}
</script>
