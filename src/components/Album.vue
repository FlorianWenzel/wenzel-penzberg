<template>
    <div class="card">
        <div class="card-body d-flex" :style="'background: url(' + image.src + ');'">
            <div class="w-100 align-self-end">
                <p class="card-text w-100"></p>
                <a @click="open" class="btn btn-info">{{name}}</a>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Album",
        props: ['image', 'name'],
        methods: {
            open(){
                this.$emit('open', this.name);
            }
        }
    }
</script>

<style scoped>
    .card-body{
        flex: 1 1 350px;
         background-repeat: no-repeat!important;
        background-size: cover!important;
        background-position: center!important;
        height: 20vh;
        min-height: 350px;
        min-width: 350px;
    }
</style>