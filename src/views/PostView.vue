<template>
    <form class="m-5" @submit="post">

        <div class="p-3" v-if="notPushing" >
            <ImageRow @click="imageClick" :key="amount" v-for="amount in Math.ceil(images.length / 3.0)" :images="images.slice((amount - 1) * 3, ((amount) * 3))" :amount="amount"></ImageRow>
        </div>

        <div v-if="uploading" class="progress mb-2">
            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" :aria-valuenow="percent_done" aria-valuemin="0" aria-valuemax="100" :style="'width: ' + percent_done + '%'"></div>
        </div>
        <div class="form-row">
            <div class="col-12 mb-3">
                <div class="input-group">
                    <div class="custom-file">
                        <input type="file" @change="selectFile" accept="image/x-png,image/gif,image/jpeg" class="custom-file-input" id="inputGroupFile04">
                        <label class="custom-file-label" for="inputGroupFile04">{{selectedFile.name}}</label>
                    </div>
                    <div class="input-group-append">
                        <button class="btn btn-outline-info" type="button" @click="upload">Hochladen!</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="form-row my-3">
            <div class="col-6">
                <DropboxChooser @addFromDropbox="addFromDropbox"></DropboxChooser>
            </div>
            <div class="col-6">
                <OnedriveChooser></OnedriveChooser>
            </div>
        </div>
        <div class="form-row mt-5">
            <div class="col-md-12 mb-3">
                <input type="text" class="form-control" v-model="title" placeholder="Titel" required>
            </div>
        </div>
        <div class="form-row">
            <div class="col-md-12 mb-3">
                <div class="form-group">
                    <Editor v-model="text"></Editor>
                </div>
            </div>
        </div>

        <div class="form-row mb-3 mt-5">
            <div class="col-12 my-2">
                <label for="tags"><i class="fas fa-tags"></i> Tags</label>
                <Tags id="tags" :tags="tags"></Tags>
            </div>
            <div class="col-lg">
                <label for="publicity"><i class="fas fa-eye"></i> Sehbar von: <br><small>(wer den Eintrag sehen kann)</small></label>
                <select id="publicity" v-model="publicity" class="custom-select" name="publicity" required>
                    <option value="">Bitte auswählen...</option>
                    <option value="public">Öffentlich</option>
                    <option value="extended">Entfernetere Verwandschaft</option>
                    <option value="close">Nähere Verwandschaft</option>
                    <option value="family">Familie</option>
                </select>
            </div>
            <div class="col-lg">
                <label for="album"><i class="fas fa-folder"></i> Album<br><small>(wird erstellt, falls es noch nicht existiert)</small></label>
                <input type="text" class="form-control" id="album" v-model="album" placeholder="Album">
            </div>
        </div>
        <div class="form-row">
            <div class="col-md-12 mb-3">
                <button type="submit" class="btn btn-info">Eintragen!</button>
            </div>
        </div>
    </form>
</template>

<script>
    import axios from 'axios';
    import Swal from 'sweetalert2';
    import DropboxChooser from "../components/DropboxChooser";
    import OnedriveChooser from "../components/OnedriveChooser";
    import ImageRow from "../components/ImageRow";
    import Tags from "../components/Tags";
    import * as env from '../assets/env';
    import Editor from "../components/Editor";

    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-info mr-1',
            cancelButton: 'btn btn-secondary'
        },
        buttonsStyling: false
    });


    export default {
        name: "PostView.vue",
        components: {Editor, Tags, ImageRow, DropboxChooser, OnedriveChooser},
        data: function(){
            return {
                editor: null,
                title: null,
                images: [],
                tags: [],
                text: "",
                publicity: "",
                timestamp: null,
                selectedFile: {name:"Bild auswählen"},
                uploading: false,
                percent_done: 0,
                album:"",
                notPushing: true
            }
        },
        props: ['user'],
        methods: {
            async imageClick(image){
                const { value: action } = await Swal.fire({
                    title: 'Was willst du tun?',
                    text: 'Bild...',
                    input: 'select',
                    inputOptions: {
                        shiftL: 'nach links verschieben',
                        shiftR: 'nach rechts verschieben',
                        del: 'entfernen'
                    },
                    inputPlaceholder: 'Aktion auswählen',
                    showCancelButton: true,
                    cancelButtonText: 'Abbrechen',
                    confirmButtonText: 'Durchführen',
                    inputValidator: (value) => {
                        return new Promise((resolve) => {
                            if(value)
                                resolve();
                            else
                                resolve("Bitte Aktion auswählen!");
                        })
                    }
                });

                const index = this.images.indexOf(image);
                switch(action){
                    case "del":
                        this.images = this.images.filter((img) => img.filename !== image.filename);
                        break;
                    case "shiftL":
                        if(index === 0) return;
                        console.log(this.images);
                        [this.images[index], this.images[index - 1]] = [this.images[index - 1], this.images[index]];
                        this.images.push('dummpy');
                        this.images.pop();
                        break;
                    case "shiftR":
                        if(index >= this.images.length - 1) return;
                        [this.images[index], this.images[index + 1]] = [this.images[index + 1], this.images[index]];
                        this.images.push('dummpy');
                        this.images.pop();
                        break;
                }
            },
            selectFile(event){
                if(event.target.files.length === 1)
                    this.selectedFile = event.target.files[0];
            },
            async addFromDropbox(files){
                for(const file of files){
                    const src = file.link.replace('?dl=0', '?raw=1');
                    const image = {src, filename: file.name, ...(await this.getMeta(src))};
                    this.notPushing = false;
                    this.images.push(image);
                    this.notPushing = true;
                }
            },
            upload(){
                if(!this.selectedFile.size){
                    return;
                }
                this.uploading = true;
                let formData = new FormData();
                formData.append('file', this.selectedFile);
                formData.append('token', localStorage.getItem('token'));
                axios.post(env.backend_url + '/upload', formData, {onUploadProgress: (data) => {
                    this.percent_done = (data.loaded / data.total) * 100;
                }})
                .then(async ({data}) => {
                    const {valid, url, filename} = data;
                    if(!valid){
                        //TODO
                        return;
                    }
                    const image = {src: url, filename, ...(await this.getMeta(url))};
                    this.notPushing = false;
                    this.images.push(image);
                    this.notPushing = true;
                    this.selectedFile = {name: "Bild auswählen"};
                    this.uploading = false;
                    this.percent_done = 0;
                })
            },
            post(event){
                event.preventDefault();

                if(this.uploading){
                    swalWithBootstrapButtons.fire('Geduld!', 'Bitte warte bis der Upload abgeschlossen ist', 'error');
                    return;
                }
                const {title, images, tags, text, publicity, album} = this;
                const post = {title, images, tags, text, publicity, album, timestamp: Date.now(), parent: localStorage.getItem('token')};
                axios.post( env.backend_url + '/post', post)
                .then(({data}) => {
                    const {valid} = data;
                    if(!valid)
                        console.log('not valid...');
                    else{
                        swalWithBootstrapButtons.fire('Erstellt!', 'Post wurde erstellt', 'success');
                        this.$router.push('/');
                    }
                })
            },
            getMeta(url) {
                return new Promise((resolve, reject) => {
                    let img = new Image();
                    img.onload = () => resolve({height: img.height, width: img.width});
                    img.onerror = reject;
                    img.src = url;
                });
            }
        },
        created(){
            const token = localStorage.getItem('token');
            if(!token){
                this.$router.push('/');
            }
        }
    }
</script>

<style scoped>
    #images{
        max-width: 90vw;
        overflow: scroll;
        min-width: 90vw;
        max-height: 50vh;
        text-align: center;
    }
    img {
        max-width: 30vw;
    }

    @media (max-width: 1000px){
        img {
            max-width: 250px;
        }
    }
</style>