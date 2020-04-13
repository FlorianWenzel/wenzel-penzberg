<template>
    <div  :class="'w-100 imagerow ' + (!mobile ? 'd-flex align-content-center' : '')">
        <div
                :key="image.filename"
                :data-sub-html="image.text"
                :data-src="image.src"
                v-for="(image, index) in images"
                :class="`img-wrapper align-self-center position-relative text-align-center overflow-hidden rotate-${!iOS ? image.orientation : 1}`"
                :style="{...sizes[index]}"
        >
            <img
                    :src="image.thumbnail_url"
                    :id="image.filename"
                    @click="click(image)"
                    class="thumbnail"
                    :alt="image.text ? image.text : ' '"
                    :style="!iOS ? {...imageSizes[index]}: {...sizes[index]}"
            />
            <img
                    :src="image.src"
                    @load="loadImage(image)"
                    @click="click(image)"
                    :style="!iOS ? {...imageSizes[index], backgroundImage: image.thumbnail_url}: {...sizes[index], backgroundImage: image.thumbnail_url}"
                    :alt="image.text ? image.text : ' '"
            />
        </div>
    </div>
</template>

<!--suppress JSSuspiciousNameCombination -->
<script>
    export default {
        name: "ImageRow",
        props: ["images", "amount"],
        data: function(){
            return {
                sizes: [],
                imageSizes: [],
                widestImage: null,
                mobile: true,
                iOS: true
            }
        },
        methods: {
            getWidth(index){
                const ratio = [];
                const imageWithHighestRatio = { ratio:0 };
                for(const image of this.images){
                    image._width = image.width;
                    image._height = image.height;
                    if(image.orientation && [6, 8, 5, 7].includes(image.orientation)){
                        image._width = image.height;
                        image._height = image.width;
                    }
                    const r = (parseInt(image._width)) / (parseInt(image._height));
                    ratio.push(r);
                    if(r > imageWithHighestRatio.ratio){
                        imageWithHighestRatio.ratio = r;
                        imageWithHighestRatio.image = image;
                    }
                }
                const full_width = ratio.reduce((accumulator, currentValue) => accumulator + currentValue);
                let in_percent = (ratio[index] / full_width);
                const screenWidthOfHighestRatio = ((parseInt(imageWithHighestRatio.image._width)) / (parseInt(imageWithHighestRatio.image._height)) / full_width) * window.innerWidth;

                const shrinkingFactor = screenWidthOfHighestRatio / imageWithHighestRatio.image._width;
                let height = imageWithHighestRatio.image._height * shrinkingFactor;


                if(window.innerWidth < 500){
                    in_percent = 1;
                    height = window.innerWidth / parseInt(this.images[index]._width) * parseInt(this.images[index]._height);
                }
                const width = in_percent * window.innerWidth;
                return {height: height + 'px', width: width + 'px'};
            },
            click(image){
                this.$emit('click', image);
            },
            loadImage(image){
                if(document.getElementById(image.filename))
                    document.getElementById(image.filename).remove();
                event.target.classList.add('loaded');
                this.$emit('imageLoad', event);
            }
        },
        watch: {
            images: function(){
                this.sizes = [];
                for(const index in this.images){
                    const image = this.images[index];
                    const size = this.getWidth(index);
                    this.sizes.push(size);
                    if(image.orientation && [6, 8, 5, 7].includes(image.orientation))
                        this.imageSizes.push({width: size.height, height: size.width, marginBottom: -size.width, marginLeft: -size.height});

                    else
                        this.imageSizes.push(size);
                }
            }
        },
        created() {
            this.iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            if(window.innerWidth > 500){
                this.mobile = false;
            }
            for(const index in this.images){
                const image = this.images[index];
                const size = this.getWidth(index);
                this.sizes.push(size);
                if(image.orientation && [6, 8, 5, 7].includes(image.orientation))
                    this.imageSizes.push({width: size.height, height: size.width});
                else
                    this.imageSizes.push(size);
            }
        }
    }
</script>

<style scoped>
    .rotate-6 img{
        /*noinspection CssInvalidPropertyValue*/
        image-orientation: none;
        transform: translate(-50%, -50%) rotate(90deg);
        top: 50%;
        left: 50%;
        position: absolute;
        text-align: center;
        max-width: 100vw!important;
        max-height: 100vh!important;
    }
    .rotate-3 img{
        transform: translate(-50%, -50%) rotate(270deg);
        white-space: nowrap;
        top: 50%;
        left: 50%;
        position: absolute;
        text-align: center;
    }
    .postImageRow>.img-wrapper {
        border: solid .5rem white;
    }
    img:hover{
        cursor: pointer;
    }
    img {
        background-size: cover;
        background-position: center;
        filter: blur(10px);
        opacity: 0;
        max-width: 100%;
        max-height: 100%;
    }
    .thumbnail {
        opacity: 1!important;
    }
    img.loaded {
        opacity: 1;
        transition: .3s filter  linear;
        filter: blur(0px);
        animation-name: none;
    }
    .imagerow>div:first-child>img{
        border-left: none;
    }
    .imagerow>div:last-child>img{
        border-right: none;
    }
</style>
