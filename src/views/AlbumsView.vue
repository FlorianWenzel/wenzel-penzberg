<template>
    <div>
        <div v-if="!refreshingAlbum" class="d-flex flex-wrap overflow-auto justify-content-center align-content-center">
            <Album v-for="name in displayedAlbums" :path="path" @open="openAlbum" :key="name" :image="previews[name]" :name="name"></Album>
        </div>
        <a v-if="path !== ''" @click="closeAlbum" class="btn btn-info m-3"><i class="fas fa-angle-left"></i> zurück</a>
        <div id="lightgallery">
            <div v-if="!refreshingAlbum && postsByAlbum[path]">
                <Post @rendered="postRendered" @editPost="editPost" :user="user" :key="index" :post="post" v-for="(post, index) in postsByAlbum[path]"></Post>
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
                reopenAt: null,
                timeout: null,
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
                if(this.openAlbumAmountOfPosts + 10 > this.postsByAlbum[this.path].length){
                    this.openAlbumAmountOfPosts = this.openAlbumAmountOfPosts.length;
                    $state.complete();

                }else{
                    this.openAlbumAmountOfPosts += 10;
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
                //TODO handle this stuff
                console.log('pop state detected..')
            };
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

<style scoped>
</style>