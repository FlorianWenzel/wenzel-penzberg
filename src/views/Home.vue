<template>
    <div class="home">
        <div>
            <Zoom :mobile="mobile" :images="allImages" :i="openIndex" @close="openIndex = -1"></Zoom>
            <Post @editPost="editPost" @imageClick="imageClick" :mobile="mobile" :user="user" :post="posts[index - 1]" :key="index" v-for="index in amountToDisplay"></Post>
        </div>
        <infinite-loading @infinite="infiniteHandler">
            <div slot="no-more"></div>
            <div slot="no-results"></div>
        </infinite-loading>
    </div>
</template>
<script>
import * as env from '../assets/env';
import Post from "../components/Post";
import InfiniteLoading from 'vue-infinite-loading';
import Zoom from "../components/Zoom";
import { get } from '../assets/cache.js';

export default {
    name: 'Home',
    components: {Zoom, Post, InfiniteLoading},
    props: ["user", "mobile"],
    data: function(){
        return {
            posts: [],
            amountToDisplay: 0,
            allImages: [],
            openIndex: -1,
        }
    },
    methods: {
        async infiniteHandler($state){
            if(this.posts.length === 0){
                this.posts = await get(env.backend_url + '/posts?token=' + localStorage.getItem('token'))
                    .then(({data}) => {
                        for(const post of data){
                            for(const image of post.images){
                                image.thumbnail = image.thumbnail_url;
                            }
                            this.allImages.push(...post.images);
                        }
                        return data;
                    });
                if(this.posts.length === 0){
                    $state.complete();
                    return;
                }
            }
            if(this.amountToDisplay + 5 > this.posts.length){
                this.amountToDisplay = this.posts.length;
                $state.complete();

            }else{
                this.amountToDisplay += 5;
                $state.loaded();
            }
      },
        editPost(post){
            this.$emit('editPost', post);
        },
        imageClick(image){
          this.openIndex = this.allImages.indexOf(image);
        }
    }
}
</script>
