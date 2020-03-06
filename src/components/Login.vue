<template>
    <div>
        <button class="btn btn-light" @click="showLoginModal">Einloggen</button>
    </div>
</template>

<script>
    import axios from 'axios';
    import Swal from 'sweetalert2';
    import * as env from '../assets/env';

    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-info mr-1',
            cancelButton: 'btn btn-secondary'
        },
        buttonsStyling: false
    });
    export default {
        name: "Login",
        data: () => { return {
            username: null,
            pwd: null,
        }},
        methods: {
            showLoginModal() {
                swalWithBootstrapButtons.fire({
                    html:
                        `
                         <h1>Login</h1>
                         <div class="input-group mb-3">
                           <input id="username"  type="text" class="form-control" placeholder="Benutzername"">
                         </div>
                         <div class="input-group mb-3">
                           <input id="pwd" type="password" class="form-control" placeholder="Passwort">
                         </div>
                        `,
                    showCancelButton: true,
                    confirmButtonText: 'Einloggen',
                    cancelButtonText: 'Abbrechen',
                    showLoaderOnConfirm: true,
                    allowEnterKey: true,
                    preConfirm: async () => {
                        const username = document.getElementById('username').value;
                        const pwd = document.getElementById('pwd').value;
                       return await axios.post(env.backend_url + '/login', {username, pwd},{crossdomain: true})
                        .then(({data}) =>{
                            if(data.valid)
                                this.$emit('login', data);
                            return data.valid;
                        })
                    }
                })
            }
        },
        created() {
        }
    }
</script>

<style scoped>

</style>