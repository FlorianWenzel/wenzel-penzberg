<template>
    <div class="vue-gallery-row">
        <div
                v-for="(image, index) in images"
                :key="index"
                :data-sub-html="image.text"
                :data-src="image.src"
                class="vue-gallery-image-wrapper"
                :style="size[index] + getBackground(image)"
        >
            <img
                    v-if="image.type !== 'video' && !loaded[index] && !noThumbnail"
                    :src="image.thumbnail_url"
                    @click="click(image)"
                    :alt="image.text ? image.text : ' '"
                    class="vue-gallery-image"
            />
            <img
                    v-if="image.type !== 'video'"
                    :src="image.src"
                    @load="loadImage(image)"
                    @click="click(image)"
                    :style="getBackground(image)"
                    :alt="image.text ? image.text : ' '"
                    class="vue-gallery-image"
            />
            <video
                    v-if="image.type === 'video' && !iOS"
                    @click="click(image)"
                    muted
                    loop
                    playsinline
                    @loadeddata="loadImage(image)"
                    class="vue-gallery-image"
                    :style="getBackground(image)"
                    :src="image.src"
                    :autoplay="!iOS"
                    :controls="iOS"
            >
                <source :src="image.src" type="video/mp4">
            </video>
        </div>
    </div>
</template>

<script>
    export default {
        name: "ImageRow",
        props: [
            "images",
            "amount",
            "width",
            "mobile",
            "borderStyle",
            "toggleTextOnClick",
            "noThumbnail",
        ],
        data: function () {
            return {
                size: [],
                loaded: [],
                hideText: [],
                iOS: false,
            };
        },
        methods: {
            updateSizes() {
                this.size = [];
                const ratio = [];
                const imageWithHighestRatio = { ratio: 0 };
                for (const image of this.images) {
                    const r = parseInt(image.width) / parseInt(image.height);
                    ratio.push(r);
                    if (r > imageWithHighestRatio.ratio) {
                        imageWithHighestRatio.ratio = r;
                        imageWithHighestRatio.image = image;
                    }
                }
                const full_width = ratio.reduce(
                        (accumulator, currentValue) => accumulator + currentValue
                );
                for (const index in this.images) {
                    let in_percent = (ratio[index] / full_width) * 100;
                    const screenWidthOfHighestRatio =
                            (parseInt(imageWithHighestRatio.image.width) /
                                    parseInt(imageWithHighestRatio.image.height) /
                                    full_width) *
                            this.width;
                    const shrinkingFactor =
                            screenWidthOfHighestRatio / imageWithHighestRatio.image.width;
                    let height = imageWithHighestRatio.image.height * shrinkingFactor;
                    this.size.push("height: " + height + "px; width: " + in_percent + "%;");
                }
            },
            click(image) {
                this.$emit("click", image);
            },
            loadImage(image) {
                const index = this.images.indexOf(image);
                this.$set(this.loaded, index, true);
                event.target.classList.add("loaded");
                this.$emit("imageLoad", event);
            },
            getBackground(image) {
                return ` background-image: url('${image.thumbnail_url}');`;
            },
        },
        watch: {
            images() {
                this.updateSizes();
            },
            width() {
                this.updateSizes();
            },
        },
        mounted() {
            this.iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        }
    };
</script>

<style scoped>
    img:hover, video:hover{
        cursor: pointer;
    }
    img, video {
        background-size: cover;
        background-position: center;
        max-width: 100vw;
        filter: blur(15px);
        transition: 0.8s filter linear;
        image-orientation: from-image;
    }
    img.loaded, video {
        filter: blur(0px);
        animation-name: none;
    }
    .vue-gallery-image-wrapper {
        border: solid thick white;
        background-size: cover;
        background-repeat: no-repeat;
        align-self: center;
        text-align: center;
        overflow: hidden;
        position: relative;
        transition: width .3s, height .3s;
    }
    .vue-gallery-row {
        width: 100%;
        display: flex;
        align-content: center;
    }
    .vue-gallery-image {
        max-height: 100%;
        width: 100%;
    }
</style>
