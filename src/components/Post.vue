<template>
    <div class="pb-5">
        <ImageRow
                class="postImageRow"
                @imageLoad="imageRowMounted"
                :key="amount" @mounted="imageRowMounted"
                @click="imageClick"
                v-for="amount in Math.ceil(post.images.length / (mobile ? 1 : 3))"
                :images="post.images.slice((amount - 1) * (mobile ? 1 : 3), ((amount) * (mobile ? 1 : 3)))"
                :amount="amount"
                :width="width"
                :height="height"
        />
        <div class="info mx-3 mb-3 p-3 pb-5">
            <h1>{{post.title}}</h1>
            <small><span v-if="!post.hide_date">{{new Date(post.timestamp).toLocaleDateString()}}</span><span v-if="!post.hide_date && !post.hide_author && post.author">   |   </span><span v-if="post.author && !post.hide_author">{{post.author.username}}</span></small>
            <div>
                <span v-bind:key="tag" v-for="tag of post.tags" class="badge badge-primary mr-1">{{tag}}</span>
                <span v-if="user && user.admin" class="badge badge-info mr-1">{{getPublicityString(post.publicity)}}</span>
                <a @click="edit(post)">
                    <i v-if="user && user.permissions.post" class="fas fa-edit"></i>
                </a>
            </div>
            <p v-html="post.text" class="pt-3">
            </p>
        </div>
    </div>
</template>

<script>
    import ImageRow from "./ImageRow";
    export default {
        name: "Post",
        components: {ImageRow},
        props: ["post", "user", "mobile"],
        data(){
            return {
                width: 1000,
                height: 1000,
            }
        },
        methods: {
            handleResize() {
                if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    this.width = this.$el.getBoundingClientRect().width;
                    this.height = this.$el.getBoundingClientRect().height;
                }, 300);
            },
            imageClick(image){
                this.$emit('imageClick', image, this.post)
            },
            getPublicityString(publicity){
                switch (publicity) {
                    case 'public':
                        return 'Öffentlich';
                    case 'other':
                        return 'Die Anderen';
                    case 'extended':
                        return 'Entferntere Verwandschaft';
                    case 'close':
                        return 'Nähere Verwandschaft';
                    case 'family':
                        return 'Familie';
                }
            },
            edit(post){
                this.$emit('editPost', post);
                this.$router.push('/neuer-beitrag/?id=' +post._id);
            },
            imageRowMounted(args){
                this.$emit('rendered', args);
            }
        },
        mounted(){
            this.width = this.$el.getBoundingClientRect().width;
            this.height = this.$el.getBoundingClientRect().height;
            window.addEventListener("resize", this.handleResize);
        }
    }
</script>

<style scoped>
    .row {
        margin: 0!important;
    }
</style>
