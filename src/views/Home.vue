<template>
  <div class="home" v-viewer ref="viewer">
      <Post @editPost="editPost" :user="user" :post="posts[index - 1]" :key="index" v-for="index in amountToDisplay"></Post>
      <infinite-loading @infinite="infiniteHandler">
          <div slot="no-more"></div>
          <div slot="no-results"></div>
      </infinite-loading>
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
import InfiniteLoading from 'vue-infinite-loading';

export default {
    name: 'Home',
    components: {Post, InfiniteLoading},
    props: ["user"],
    data: function(){
        return {
            posts: [],
            amountToDisplay: 0,
            allImages: [],
            infiniteState: null,
        }
    },
    methods: {
        async infiniteHandler($state){
            this.infiniteState = $state;
            if(this.posts.length === 0){
                this.posts = await axios.get(env.backend_url + '/posts?token=' + localStorage.getItem('token'))
                    .then(({data}) => {
                        for(const post of data){
                            this.allImages.push(...post.images);
                        }
                        return data;
                    });
                if(this.posts.length === 0){
                    $state.complete()
                    return;
                }
            }
            if(this.amountToDisplay + 10 > this.posts.length){
                this.amountToDisplay = this.posts.length;
                $state.complete();

            }else{
                this.amountToDisplay += 10;
                $state.loaded();
            }
      },
        editPost(post){
            this.$emit('editPost', post);
        }
    },
    mounted() {
        this.$refs.viewer.addEventListener('view', async (event) => {
            event.detail.originalImage.scrollIntoView();
            const {index} = event.detail;
            const amountOfImagesDisplayed = this.$refs.viewer.viewer.images.length - 1;
            if(index === amountOfImagesDisplayed){
                await this.infiniteHandler(this.infiniteState);
            }
        })
    }
}
</script>
