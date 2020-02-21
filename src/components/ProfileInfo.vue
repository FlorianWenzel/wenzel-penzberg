<template>
    <div class="text-light">
        {{username}}
        <img :src="img" alt="">
    </div>
</template>

<script>
    export default {
        name: "ProfileInfo",
        props: ['username', 'img'],
        methods: {
        },
        created() {
            console.log(this.username, this.img)
        }
    }
</script>

<style scoped>
img {
    height: 32px;
    border-radius: 50%;
    border: solid 1px white;
}
</style>