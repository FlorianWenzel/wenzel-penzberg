<template>
    <div>
        <div v-if="!albumOpen" class="d-flex flex-wrap overflow-auto justify-content-center align-content-center">
            <Album v-for="album in albums" @open="openAlbum" :key="album" :image="previews[album]" :name="album"></Album>
        </div>
        <div v-if="albumOpen">
            <a @click="closeAlbum" class="btn btn-info m-3"><i class="fas fa-angle-left"></i> zurück</a>
            <div v-viewer>
                <Post :user="user" :key="index" :post="post" v-for="(post, index) of openAlbumPosts"></Post>
            </div>
            <a @click="closeAlbum" class="btn btn-info mb-3"><i class="fas fa-angle-left"></i> zurück</a>
        </div>
    </div>

</template>

<script>
    import axios from "axios";
    import Album from "../components/Album";
    import * as env from '../assets/env';
    import Post from "../components/Post";
    let _this;

    export default {
        name: "AlbumsView.vue",
        components: {Post, Album},
        props: ["user"],
        data(){
            return {
                posts: [],
                albums: [],
                previews: {},
                openAlbumPosts: [],
                albumOpen: false,
                openAlbumAllImages: []
            }
        },
        methods: {
            openAlbum(album){
                this.openAlbumPosts = [];
                this.albumOpen = true;
                history.pushState(null, album, album);
                for(const post of this.posts){
                    if(post.album && post.album === album){
                        this.openAlbumPosts.push(post);
                    }
                }
            },
            closeAlbum(){
                this.albumOpen = false;
                history.pushState(null, 'Albums', '/alben/')
            }
        },
        created() {
            _this = this;
            window.addEventListener('popstate', () => {
                if(_this && _this.albumOpen)
                    _this.albumOpen = false;
            });
            const location = window.location;
            const albumInURL = decodeURIComponent(location.pathname.split('/')[2]);
            const token = localStorage.getItem('token');
            axios.get(env.backend_url + '/posts?token=' + token)
                .then(({data}) => {
                    this.posts = data;
                    for(const post of this.posts){
                        if(post.album && post.images.length > 0){
                            if(!this.albums.includes(post.album)){
                                this.albums.push(post.album);
                            }
                            this.previews[post.album] = post.images[Math.floor(Math.random() * post.images.length)];
                        }
                    }
                    if(albumInURL)
                        this.openAlbum(albumInURL);
                })
        }
    }
</script>

<style scoped>
</style>