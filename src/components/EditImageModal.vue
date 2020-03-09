<template>
    <modal name="EditImageModal" :width="modalWidth" :height="500" :minWidth="300" @before-open="loadImage">
        <div class="m-3 text-center">
            <img :src="image.src" height="auto" width="200px" style="max-height: 300px;" alt=" "><br>
            <label for="text">Text</label>
            <input id="text" class="form-control" type="text" v-model="image.text">
            <div class="d-flex m-0 mt-3">
                <div class="w-50 pr-1">
                    <button type="button" @click="swapL" class="btn btn-info w-100"><i class="fas fa-chevron-left"></i><span v-if="!mobile"> nach links verschieben</span></button>
                </div>
                <div class="w-50 pl-1">
                    <button type="button" @click="swapR" class="btn btn-info w-100"><i class="fas fa-chevron-right"></i><span v-if="!mobile"> nach rechts verschieben</span></button>
                </div>
            </div>
            <div class="w-100 pt-2">
                <button type="button" @click="remove" class="btn btn-danger w-100"><i class="fas fa-times"></i><span> löschen</span></button>
            </div>
        </div>
    </modal>
</template>

<script>
    export default {
        name: "EditImageModal",
        data(){
            return {
                image: {
                    text: '',
                    filename: ''
                },
                modalWidth: '80%'
            }
        },
        props: ['mobile'],
        methods: {
            loadImage (event) {
                this.modalWidth = window.innerWidth;
                this.image = event.params.image;
            },
            swapL(){
                this.$emit('swapL', this.image);
            },
            swapR(){
                this.$emit('swapR', this.image);
            },
            remove(){
                this.$emit('remove', this.image);
                this.$modal.hide('EditImageModal');
            }
        },
        watch: {
            "image.text": function(){
                this.$emit('saveText', this.image.filename, this.image.text);
            }
        }
    }
</script>

<style scoped>

</style>