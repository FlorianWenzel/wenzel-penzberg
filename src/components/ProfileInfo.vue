<template>
    <div class="text-light">
        {{username}}
    </div>
</template>

<script>
    export default {
        name: "ProfileInfo",
        props: ['username', 'img'],
        methods: {
        },
        created() {
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