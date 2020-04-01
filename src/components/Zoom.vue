<template>
    <div v-if="i !== -1" class="photo d-flex align-items-center justify-content-center">
        <ImageRow class="row" :images="[images[index]]" amount="1"></ImageRow>
        <div v-if="images.length !== 1" @click="previous" class="prev"><i class="fas fa-angle-left fa-2x text-light"></i></div>
        <div class="close" @click="$emit('close')"><i class="fas fa-times text-light fa-2x"></i></div>
        <div v-if="images.length !== 1" @click="next" class="next"><i class="fas fa-angle-right fa-2x text-light"></i></div>
    </div>
</template>

<script>
    import ImageRow from "./ImageRow";
    let zoom;

    export default {
        name: "Zoom",
        components: {ImageRow},
        data(){
            return {
                index: null
            }
        },
        props: ["images", "i"],
        mounted(){
            zoom = this;
            document.addEventListener('keydown', ({key}) => {
                if(zoom && zoom.index === -1) return;
                if(key === 'ArrowLeft')
                    zoom.previous();
                else if(key === 'ArrowRight')
                    zoom.next();

            })
        },
        methods: {
            previous(){
                if(this.index === 0)
                    this.index = this.images.length - 1;
                else
                    this.index--;
            },
            next(){
                if(this.index === this.images.length - 1)
                    this.index = 0;
                else
                    this.index++;

            }
        },
        watch: {
            i(){
                this.index = this.i;
                if(this.i !== -1){
                    document.querySelector('body').style.overflowY = 'hidden';
                }else{
                    document.querySelector('body').style.overflowY = 'scroll';
                }
            }
        },
    }
</script>

<style scoped>
    body {
        overflow-y: hidden;
        position: fixed;
    }
    .photo {
        z-index: 200;
        position: fixed;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: #363636;
        overflow-y: hidden;
    }
    .photo>.row {
        height: auto;
        width: auto;
        max-height: 100vh;
        max-width: 100vw;
    }
    .close {
        position: fixed;
        right: 3px;
        top: 3px;
    }
    .prev {
        padding: 16px;
        background: rgba(54, 54, 54, .6);
        position: fixed;
        left: 0;
        top: calc(50vh - 32px);
        height: 64px!important;
    }
    .next {
        padding: 16px;
        background: rgba(54, 54, 54, .6);
        position: fixed;
        right: 0;
        top: calc(50vh - 32px);
        height: 64px!important;
    }
    .img-wrapper{
        border: none!important;
    }
</style>