<template>
    <div>
        <div v-if="!refreshingAlbum" class="d-flex flex-wrap overflow-auto justify-content-center align-content-center">
            <Album v-for="name in displayedAlbums" :path="path" @open="openAlbum" :key="name" :image="previews[name]" :name="name"></Album>
        </div>
        <a v-if="path !== ''" @click="closeAlbum" class="btn btn-info m-3"><i class="fas fa-angle-left"></i> zurück</a>
        <div v-viewer ref="viewer">
            <div v-if="!refreshingAlbum && postsByAlbum[path]">
                    <Post @editPost="editPost" :user="user" :key="index" :post="post" v-for="(post, index) in postsByAlbum[path]"></Post>
                <infinite-loading @infinite="infiniteHandler">
                    <div slot="no-more"></div>
                    <div slot="no-results"></div>
                </infinite-loading>
                <a @click="closeAlbum" class="btn btn-info mb-3"><i class="fas fa-angle-left"></i> zurück</a>
            </div>
        </div>
    </div>

</template>

<script>
    import axios from "axios";
    import Album from "../components/Album";
    import * as env from '../assets/env';
    import Post from "../components/Post";
    import InfiniteLoading from 'vue-infinite-loading';
    let _this;

    export default {
        name: "AlbumsView.vue",
        components: {Post, InfiniteLoading, Album},
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
                infiniteState: null,
                path: '',
            }
        },
        methods: {
            openAlbum(album){
                this.refreshingAlbum = true;
                if(this.path.length > 0)
                    this.path += '/';
                this.path += album;
                if(!location.pathname.includes(this.path))
                    history.pushState(null, this.path, this.path);
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
                if(this.openAlbumAmountOfPosts + 3 > this.postsByAlbum[this.path].length){
                    this.openAlbumAmountOfPosts = this.openAlbumAmountOfPosts.length;
                    $state.complete();

                }else{
                    this.openAlbumAmountOfPosts += 3;
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
                const relevant = this.albums.filter(album => (album.includes(path) && album !== path));
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
            }
        },
        watch:{
            path(){
                this.syncDisplayedAlbums();
            }
        },
        created() {
            _this = this;
            window.addEventListener('popstate', () => {
                if(_this && _this.albumOpen)
                    _this.albumOpen = false;
            });
            this.loadPosts();
            window.onpopstate = () => {
                //TODO handle this stuff
                console.log('pop state detected..')
            };
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

<style scoped>
</style>