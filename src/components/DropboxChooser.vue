import Swal from "sweetalert2";
<template>
    <button @click="open" type="button" class="btn btn-info w-100"><i class="fab fa-dropbox"></i> aus der Kiste</button>
</template>

<script>

    export default {
        name: "DropboxChooser",
        data: function(){
            return{
                Dropbox: null,
            }
        },
        methods: {
            open: function(event){
                let options =
                    {
                        success: async files => {
                            this.$emit('addFromDropbox', files);
                        },
                        cancel: function() {
                        },
                        linkType: "preview",
                        multiselect: true,
                        extensions: [
                            ".gif",
                            ".png",
                            ".jpeg",
                            ".jpg"
                        ],
                        folderselect: false, // or true
                        sizeLimit: 102400000 // or any positive number
                    };
                window.Dropbox.choose(options);
                event.preventDefault();
            }
        }
    }
</script>

<style scoped>

</style>