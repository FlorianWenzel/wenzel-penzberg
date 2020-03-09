<template>
    <div  :class="'w-100 imagerow ' + (!mobile ? 'd-flex align-content-center' : '')">
        <div :key="image.filename" v-for="(image, index) in images" class="img-wrapper align-self-center overflow-hidden" :style="widths[index]">
            <img :src="image.src" @load="loadImage" @click="click(image)" :style="getBackground(image)" :alt="image.text ? image.text : ' '" class="w-100 h-100"/>
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
                mobile: true,
            }
        },
        methods: {
            getWidth(index){
                if(window.innerWidth < 500){
                    return 'height: auto; width: 100%;';
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
                this.$emit('imageLoad', event);
            },
            getBackground(image){
                return `background-image: url('${image.thumbnail_url}')`;
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
            if(window.innerWidth > 500){
                this.mobile = false;
            }
            for(const index in this.images){
                this.widths.push(this.getWidth(index));
            }
        }
    }
</script>

<style scoped>
    .img-wrapper {
        border: solid thin white;
    }
    img:hover{
        cursor: pointer;
    }
    img {
        background-size: cover;
        background-position: center;
        background-color: #363636;
        filter: blur(10px);
    }
    img.loaded {
        transition: .3s filter  linear;
        filter: blur(0px);
    }
    .imagerow>div:first-child>img{
        border-left: none;
    }
    .imagerow>div:last-child>img{
        border-right: none;
    }
</style>