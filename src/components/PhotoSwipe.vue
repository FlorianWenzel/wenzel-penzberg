<template>
    <!-- Root element of PhotoSwipe. Must have class pswp. -->
    <div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">

        <!-- Background of PhotoSwipe.
             It's a separate element as animating opacity is faster than rgba(). -->
        <div class="pswp__bg"></div>

        <!-- Slides wrapper with overflow:hidden. -->
        <div class="pswp__scroll-wrap">

            <!-- Container that holds slides.
                PhotoSwipe keeps only 3 of them in the DOM to save memory.
                Don't modify these 3 pswp__item elements, data is added later on. -->
            <div class="pswp__container">
                <div class="pswp__item"></div>
                <div class="pswp__item"></div>
                <div class="pswp__item"></div>
            </div>

            <!-- Default (PhotoSwipeUI_Default) interface on top of sliding area. Can be changed. -->
            <div class="pswp__ui pswp__ui--hidden">

                <div class="pswp__top-bar">

                    <!--  Controls are self-explanatory. Order can be changed. -->

                    <div class="pswp__counter"></div>

                    <button class="pswp__button pswp__button--close" title="Close (Esc)"></button>

                    <button class="pswp__button pswp__button--share" title="Share"></button>

                    <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>

                    <button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>

                    <!-- Preloader demo https://codepen.io/dimsemenov/pen/yyBWoR -->
                    <!-- element will get class pswp__preloader--active when preloader is running -->
                    <div class="pswp__preloader">
                        <div class="pswp__preloader__icn">
                            <div class="pswp__preloader__cut">
                                <div class="pswp__preloader__donut"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
                    <div class="pswp__share-tooltip"></div>
                </div>

                <button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)">
                </button>

                <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)">
                </button>

                <div class="pswp__caption">
                    <div class="pswp__caption__center"></div>
                </div>

            </div>

        </div>

    </div>
</template>

<script>
    import PhotoSwipe from 'photoswipe';
    import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default'

    export default {
        name: "PhotoSwipe",
        data(){
            return {
                instance: null
            }
        },
        props: ["images"],
        mounted(){
            var options = {
                // optionName: 'option value'
                // for example:
                index: 0 ,// start at first slide
            };
            this.instance = new PhotoSwipe(document.querySelector('.pswp'), PhotoSwipeUI_Default, [
                {
                    src: 'http://127.0.0.1:3000/image/0cba327f-3789-4ec4-acac-ea277d787232.jpg?token=eyJhbGciOiJIUzI1NiJ9.MGNiYTMyN2YtMzc4OS00ZWM0LWFjYWMtZWEyNzdkNzg3MjMyLmpwZw.4Y0v0DNlIDv8sT8v5J9vFCjmO0a3O1L8GC0733FAMiE',
                    w: 600,
                    h: 400
                },
                {
                    src: 'http://127.0.0.1:3000/image/0cba327f-3789-4ec4-acac-ea277d787232.jpg?token=eyJhbGciOiJIUzI1NiJ9.MGNiYTMyN2YtMzc4OS00ZWM0LWFjYWMtZWEyNzdkNzg3MjMyLmpwZw.4Y0v0DNlIDv8sT8v5J9vFCjmO0a3O1L8GC0733FAMiE',
                    w: 1200,
                    h: 900
                }
            ], options);
            this.instance.init();
            this.instance.open();
            this.instance.goTo(0);
        }
    }
</script>

<style scoped>
    .pswp{
        width: 100vw;
        height: 100vh;
    }
</style>