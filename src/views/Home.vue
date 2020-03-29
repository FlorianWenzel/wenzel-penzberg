<template>
    <div class="home">
        <div id="lightgallery">
            <Post @editPost="editPost" @rendered="postRendered" :user="user" :post="posts[index - 1]" :key="index" v-for="index in amountToDisplay"></Post>
        </div>
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
let _this;

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
            reopenAt: null,
            timeout: null
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
                    $state.complete();
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
        },
        postRendered(){
            clearTimeout(this.timeout);
            this.timeout = setTimeout(this.loadLightGallery, 1000);
        },
        async loadLightGallery(){
            if(window.lgData[document.getElementById('lightgallery').getAttribute('lg-uid')]){
                await window.lgData[document.getElementById('lightgallery').getAttribute('lg-uid')].destroy(true);
            }
            window.lightGallery(document.getElementById('lightgallery'), {
                counter: false,
                download: true,
                fullscreen: true,
                thumbnail: false,
                selector: '.img-wrapper'
            });
            if(this.reopenAt){
                setTimeout(() => {
                    if(this.reopenAt){
                        document.querySelectorAll('.img-wrapper')[this.reopenAt - 1].click();
                        this.reopenAt = null;
                    }
                }, 1000)
            }

        }
    },
    mounted() {
        _this = this;
        document.getElementById('lightgallery').addEventListener('onAfterSlide', (event) => {
            let amountOfDisplayedImages = 0;
            for(let index = 0; index < _this.amountToDisplay; index++){
                amountOfDisplayedImages += _this.posts[index].images.length;
            }
            if(event.detail.index + 2 > amountOfDisplayedImages){
                _this.reopenAt = event.detail.index;
                _this.infiniteHandler(_this.infiniteState);
            }
        })
    }
}
</script>
