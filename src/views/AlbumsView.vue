<template>
    <div>
        <div v-if="!refreshingAlbum" class="d-flex flex-wrap overflow-auto justify-content-center align-content-center">
            <Album v-for="name in displayedAlbums" :path="path" @open="openAlbum" :key="name" :image="previews[name]" :name="name"></Album>
        </div>
        <a v-if="path !== ''" @click="closeAlbum" class="btn btn-info m-3"><i class="fas fa-angle-left"></i> zurück</a>
        <div v-if="!refreshingAlbum && postsByAlbum[path]">
            <Post @editPost="editPost" @imageClick="imageClick" :user="user" :key="index" :post="postsByAlbum[path][index - 1]" v-for="(index) in openAlbumAmountOfPosts"></Post>
            <Zoom :images="openAlbumAllImages" :i="openIndex" @close="openIndex = -1"></Zoom>
            <infinite-loading @infinite="infiniteHandler">
                <div slot="no-more"></div>
                <div slot="no-results"></div>
            </infinite-loading>
            <a @click="closeAlbum" class="btn btn-info mb-3"><i class="fas fa-angle-left"></i> zurück</a>
        </div>
    </div>

</template>

<script>
    import axios from "axios";
    import Album from "../components/Album";
    import * as env from '../assets/env';
    import Post from "../components/Post";
    import InfiniteLoading from 'vue-infinite-loading';
    import Zoom from "../components/Zoom";
    let _this;

    export default {
        name: "AlbumsView.vue",
        components: {Zoom, Post, InfiniteLoading, Album},
        props: ["user"],
        data(){
            return {
                posts: [],
                albums: [],
                displayedAlbums: [],
                preview: null,
                previews: {},
                postsByAlbum: {},
                openAlbumAmountOfPosts: 0,
                refreshingAlbum: false,
                openAlbumAllImages: [],
                path: '',
                infiniteState: null,
                openIndex: -1,
            }
        },
        methods: {
            openAlbum(album){
                this.refreshingAlbum = true;
                if(this.path.length > 0)
                    this.path += '/';
                this.path += album;
                if(!location.pathname.includes(this.path))
                    history.pushState(null, this.path, '/alben/' + this.path);
                this.openAlbumAllImages = [];
                for(const post of this.posts){
                    if(post.album === this.path){
                        Array.prototype.push.apply(this.openAlbumAllImages, post.images);
                    }
                }
                this.refreshingAlbum = false;
            },
            closeAlbum(){
                this.refreshingAlbum = true;
                this.openAlbumAmountOfPosts = 0;
                const paths = this.path.split('/');
                paths.pop();
                this.path = paths.join('/');
                history.pushState(null, this.path, '/alben/' + this.path);
                this.refreshingAlbum = false;
            },
            async infiniteHandler($state){
                this.infiniteState = $state;
                if(this.posts.length === 0 || this.postsByAlbum[this.path].length === 0){
                    await this.loadPosts();
                    if(this.postsByAlbum[this.path].length === 0){
                        $state.complete();
                        return;
                    }
                }
                if(this.openAlbumAmountOfPosts + 5 > this.postsByAlbum[this.path].length){
                    this.openAlbumAmountOfPosts = this.postsByAlbum[this.path].length;
                    $state.complete();

                }else{
                    this.openAlbumAmountOfPosts += 5;
                    if($state)
                        $state.loaded();
                }
            },
            async loadPosts(){
                const location = window.location;
                const albumInURL = decodeURIComponent(location.pathname.split('/').splice(2).join('/'));
                const token = localStorage.getItem('token');
                await axios.get(env.backend_url + '/posts?token=' + token)
                    .then(({data}) => {
                        this.posts = data;
                        for(const post of this.posts){
                            if(post.album){
                                if(this.postsByAlbum[post.album]){
                                    this.postsByAlbum[post.album].push(post);
                                }else{
                                    this.postsByAlbum[post.album] = [post];
                                }
                                if(!this.albums.includes(post.album)){
                                    this.albums.push(post.album);
                                this.previews[post.album] = post.images[Math.floor(Math.random() * post.images.length)];
                                }
                            }
                        }
                        if(albumInURL)
                            this.openAlbum(albumInURL);
                        this.syncDisplayedAlbums();
                    })
            },
            async syncDisplayedAlbums(){
                const path = this.path;
                let relevant = this.albums;
                if(path)
                    relevant = this.albums.filter(album => album.includes(path + '/'));
                this.displayedAlbums = [...new Set(relevant.map(album => {
                    const replaced = path !== '' ? album.replace(path + '/', '') : album;
                    return replaced.split('/')[0]
                }))];
                for(const album of this.displayedAlbums){
                    if(!this.previews[album]){
                        for(const previewName in this.previews){
                            if(previewName.includes(album)){
                                this.previews[album] = this.previews[previewName];
                                break;
                            }
                        }
                    }
                }
                this.displayedAlbums = this.displayedAlbums.sort();
            },
            editPost(post){
                this.$emit('editPost', post);
            },
            imageClick(image){
                this.openIndex = this.openAlbumAllImages.indexOf(image);
            }
        },
        watch:{
            path(){
                this.syncDisplayedAlbums();
            }
        },
        created() {
            window.addEventListener('popstate', () => {
                if(_this && _this.albumOpen)
                    _this.albumOpen = false;
            });
            this.loadPosts();
            window.onpopstate = () => {
                window.location.reload();
            };
        },
        mounted() {
            _this = this;
        }
    }
</script>

<style scoped>
</style>