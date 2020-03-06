<template>
    <div  class="d-flex align-content-center w-100 imagerow">
        <div :key="image.filename" v-for="(image, index) in images" class="align-self-center" :style="widths[index]">
            <img :src="image.src" @load="loadImage"  @click="click(image)" alt="" class="w-100 h-100"/>
        </div>
    </div>
</template>

<script>
    export default {
        name: "ImageRow",
        props: ["images", "amount"],
        data: function(){
            return {
                widths: [],
                widestImage: null,
            }
        },
        methods: {
            getWidth(index){
                if(window.innerWidth < 500){
                    return 'col-12 p-2';
                }
                const ratio = [];
                const imageWithHighestRatio = { ratio:0 };
                for(const image of this.images){
                    const r = (parseInt(image.width)) / (parseInt(image.height));
                    ratio.push(r);
                    if(r > imageWithHighestRatio.ratio){
                        imageWithHighestRatio.ratio = r;
                        imageWithHighestRatio.image = image;
                    }
                }
                const full_width = ratio.reduce((accumulator, currentValue) => accumulator + currentValue);
                const in_percent = (ratio[index] / full_width) * 100;
                const screenWidthOfHighestRatio = ((parseInt(imageWithHighestRatio.image.width)) / (parseInt(imageWithHighestRatio.image.height)) / full_width) * window.innerWidth;
                const shrinkingFactor = screenWidthOfHighestRatio / imageWithHighestRatio.image.width;
                const height = imageWithHighestRatio.image.height * shrinkingFactor;
                return 'height: ' + height + 'px; width: ' + in_percent + '%;';
            },
            click(image){
                this.$emit('click', image);
            },
            loadImage(event){
                event.target.classList.add('loaded');
            }
        },
        watch: {
            images: function(){
                this.widths = [];
                for(const index in this.images){
                    this.widths.push(this.getWidth(index));
                }
            }
        },
        created() {
            for(const index in this.images){
                this.widths.push(this.getWidth(index));
            }
        }
    }
</script>

<style scoped>
    img:hover{
        cursor: pointer;
    }
    img {
        background-size: cover;
        background-position: center;
        background-color: #363636;
        border: solid thin white;
    }
    img.loaded {
        transition: .3s filter linear;
        filter: blur(0px);
    }
    .imagerow>div:first-child>img{
        border-left: none;
    }
    .imagerow>div:last-child>img{
        border-right: none;
    }
</style>