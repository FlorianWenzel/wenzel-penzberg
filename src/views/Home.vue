<template>
    <div class="home">
        <Zoom :mobile="mobile" :images="allImages" :i="openIndex" @close="openIndex = -1"></Zoom>
        <div id="posts">
            <Post @editPost="editPost" @imageClick="imageClick" :mobile="mobile" :user="user" :post="posts[index - 1]" :key="index" v-for="index in amountToDisplay"></Post>
        </div>
        <infinite-loading @infinite="infiniteHandler">
            <div slot="no-more"></div>
            <div slot="no-results"></div>
        </infinite-loading>
    </div>
</template>
<script>
import axios from 'axios';
import * as env from '../assets/env';
import Post from "../components/Post";
import InfiniteLoading from 'vue-infinite-loading';
import Zoom from "../components/Zoom";
import PullToRefresh from 'pulltorefreshjs';

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
            infiniteState: null,
        }
    },
    methods: {
        async infiniteHandler($state){
            if($state && !this.infiniteState)
                this.infiniteState = $state;
            if(this.posts.length === 0){
                await this.refresh();
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
        refresh(){
            this.posts = [];
            this.amountToDisplay = 0;
            return new Promise((resolve) => {
                axios.get(env.backend_url + '/posts?token=' + localStorage.getItem('token'))
                .then(({data}) => {
                    for(const post of data){
                        this.allImages.push(...post.images);
                    }
                    this.posts = data;
                    this.infiniteHandler(this.infiniteState);
                    resolve();
                });
            })
        },
        editPost(post){
            this.$emit('editPost', post);
        },
        imageClick(image){
            this.openIndex = this.allImages.indexOf(image);
        }
    },
    mounted(){
        const _this = this;
        PullToRefresh.init({
            mainElement: '#posts',
            instructionsPullToRefresh: 'Aktualisieren?',
            instructionsReleaseToRefresh: 'Loslassen, um zu aktuallisieren',
            instructionsRefreshing: 'Aktuallisiert!',
            onRefresh() {
                _this.refresh();
            }
        });
    }
}
</script>
