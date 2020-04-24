<template>
    <div v-if="i !== -1" class="photo d-flex align-items-center justify-content-center">
        <div v-if="playing" class="progress bg-transparent">
            <div class="progress-bar h-25 bg-info" role="progressbar" :aria-valuenow="progressValue" :aria-valuemin="0"  :style="'width: ' + progressValue + 'vw;'" aria-valuemax="100"></div>
        </div>
        <video
                v-if="images[index].type === 'video'"
                controls
                autoplay
                v-touch:swipe="swipe"
                :src="images[index].src"
        >
            <source :src="images[index].src" type="video/mp4">
        </video>
        <img
                v-if="images[index].type !== 'video'"
                @click="play"
                v-touch:swipe="swipe"
                :src="images[index].src"
                :alt="images[index].text"
        >
        <div v-if="images.length !== 1 && !(isTouch() && mobile)" @click="previous" class="prev"><i class="fas fa-angle-left fa-2x text-light"></i></div>
        <div v-if="false" class="play" @click="play">
            <i v-if="!playing" class="fas fa-play text-light"></i>
            <i v-if="playing" class="fas fa-pause text-light"></i>
        </div>
        <div class="close" @click="close">
            <i class="fas fa-times text-light"></i>
        </div>
        <div v-if="images[index].text && !displayText" @click="showText" class="showText"><i class="fas fa-angle-up fa-2x text-light"></i></div>
        <div v-if="images[index].text && displayText" v-touch:swipe.bottom="hideText" @click="hideText" class="text">{{images[index].text}}</div>
        <div v-if="images.length !== 1 && !(isTouch() && mobile)" @click="next" class="next"><i class="fas fa-angle-right fa-2x text-light"></i></div>
    </div>
</template>

<script>
    let zoom;

    export default {
        name: "Zoom",
        data(){
            return {
                index: null,
                interval: null,
                playing: false,
                progressValue: 0,
                displayText: true
            }
        },
        props: ["images", "i", "mobile"],
        mounted(){
            zoom = this;
            document.addEventListener('keydown', ({key}) => {
                if(zoom && zoom.index === -1) return;
                if(key === 'ArrowLeft')
                    zoom.previous();
                else if(key === 'ArrowRight')
                    zoom.next();
                else if(key === 'Escape')
                    zoom.close();

            });
        },
        methods: {
            close(){
                if(this.playing){
                    this.play();
                }
                this.$emit('close');
            },
            isTouch() {
                const prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
                const mq = query => window.matchMedia(query).matches;
                if (('ontouchstart' in window) || window.DocumentTouch && document instanceof "DocumentTouch") {
                    return true;
                }
                const query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
                return mq(query);
            },
            previous(){
                this.progressValue = 0;
                if(this.index === 0)
                    this.index = this.images.length - 1;
                else
                    this.index--;
            },
            next(){
                this.progressValue = 0;
                if(this.index === this.images.length - 1)
                    this.index = 0;
                else
                    this.index++;

            },
            play(){
                if(this.playing){
                    clearInterval(this.interval);
                    zoom.progressValue = 0;
                    this.playing = false;
                }else{
                    this.interval = setInterval(() => {
                        zoom.progressValue += .5;
                        if(zoom.progressValue >= 100){
                            zoom.progressValue = 0;
                            zoom.next();
                        }
                    }, 25);
                    this.playing = true;
                }
            },
            showText(){
                this.displayText = true;
            },
            hideText(){
                this.displayText = false;
            },
            swipe(direction){
                if(direction === 'left'){
                    this.next();
                }else if(direction === 'right'){
                    this.previous();
                }
            }
        },
        watch: {
            i(){
                this.index = this.i;
                if(this.i !== -1){
                    document.querySelector('body').style.overflowY = 'hidden';
                    document.querySelector('html').style.overflowY = 'hidden';
                }else{
                    document.querySelector('body').style.overflowY = 'scroll';
                    document.querySelector('html').style.overflowY = 'scroll';
                }
            }
        },
    }
</script>

<style scoped>
    * {
        overflow: hidden;
    }
    img, video {
        max-height: 100vh;
        max-width: 100vw;
    }
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
        right: 1rem;
        top: 1rem;
    }
    .prev {
        padding: 16px 8px 16px 8px;
        background: rgba(54, 54, 54, .6);
        position: fixed;
        left: 0;
        top: calc(50vh - 32px);
        height: 64px!important;
    }
    .play {
        padding: 8px;
        line-height: 8px;
        background: rgba(54, 54, 54, .6);
        position: fixed;
        left: calc(50vw - 23px);
        top: 0;
        height: 64px!important;
    }
    .next {
        padding: 16px 8px 16px 8px;
        background: rgba(54, 54, 54, .6);
        position: fixed;
        right: 0;
        top: calc(50vh - 32px);
        height: 64px!important;
    }
    .text{
        padding: 8px;
        line-height: 16px;
        background: rgba(54, 54, 54, .6);
        position: fixed;
        bottom: 0;
        width: 100vw;
        color: white;
    }
    .progress{
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 1rem;
        border-radius: 0!important;
        z-index: 103;

    }
    .showText {
        padding: 8px;
        line-height: 8px;
        background: rgba(54, 54, 54, .6);
        position: fixed;
        bottom: 0;
        left: calc(50vw - 23px);
        color: white;
    }
    .progress > .progress-bar{
        transition: none!important;
    }
</style>

