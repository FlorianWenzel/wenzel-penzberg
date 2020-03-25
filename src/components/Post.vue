<template>
    <div class="pb-5">
        <ImageRow :key="amount" @click="imageClick" v-for="amount in Math.ceil(post.images.length / 3.0)" :images="post.images.slice((amount - 1) * 3, ((amount) * 3))" :amount="amount"></ImageRow>
        <div class="info mx-3 mb-3 p-3 pb-5">
            <h1>{{post.title}}</h1>
            <small>{{new Date(post.timestamp).toLocaleDateString()}}<span v-if="post.author"> - {{post.author.username}}</span></small>
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
        props: ["post", "user"],
        methods: {
            imageClick(image){
                this.$emit('imageClick', image, this.post)
            },
            getPublicityString(publicity){
                switch (publicity) {
                    case 'public':
                        return 'Öffentlich';
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
            }
        }
    }
</script>

<style scoped>
    .row {
        margin: 0!important;
    }
</style>