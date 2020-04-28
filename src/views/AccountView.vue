<template>
    <div>
        <div v-if="user && user.admin">
            <h3>Alle Accounts</h3>
            <div style="max-width: 100vw; overflow-x: scroll;">
                <table class="table">
                    <thead>
                    <tr>
                        <th scope="col">Benutzername</th>
                        <th scope="col">Kann sehen</th>
                        <th scope="col">Kann Einträge erstellen</th>
                        <th scope="col">Kann Accounts erstellen</th>
                        <th v-if="online" scope="col">Löschen</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr :key="user._id" v-for="user of users">
                        <th scope="row">{{user.username}}</th>
                        <td>{{getPublicityString(user.publicity)}}</td>
                        <td><i v-if="user.permissions.post" class="fas fa-check"></i><i v-if="!user.permissions.post" class="fas fa-times"></i></td>
                        <td><i v-if="user.admin" class="fas fa-check"></i><i v-if="!user.admin" class="fas fa-times"></i></td>
                        <td v-if="online">
                            <button @click="deleteAccount(user)" type="button" class="btn btn-danger px-2 py-0"><i class="fas fa-times"></i></button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <hr class="my-5" />
            <h3>Neuen Account erstellen</h3>
            <form class="m-5" @submit="createAccount">
                <div class="form-row">
                    <div class="col-md-12 mb-3">
                        <label for="username">Benutzername</label>
                        <input type="text" :disabled="!online" class="form-control" v-model="newAccount.username" id="username" placeholder="Benutzername" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="col-md-12 mb-3">
                        <label for="password">Passwort</label>
                        <input type="text" :disabled="!online" class="form-control" v-model="newAccount.password" id="password" placeholder="Passwort" required>
                    </div>
                </div>
                <div class="form-row mb-3">
                    <div class="col-lg">
                        <label for="publicity"><i class="fas fa-eye"></i> Kann sehen:</label>
                        <select id="publicity" :disabled="!online" v-model="newAccount.publicity" class="custom-select" name="publicity" required>
                            <option value="">Bitte auswählen...</option>
                            <option value="public">Öffentlich</option>
                            <option value="other">Die Anderen</option>
                            <option value="extended">Entfernetere Verwandschaft</option>
                            <option value="close">Nähere Verwandschaft</option>
                            <option value="family">Familie</option>
                        </select>
                    </div>
                </div>
                <div class="text-left form-group">
                    <div class="form-row">
                        <div class="col-md mb-3">
                            <input type="checkbox" :disabled="!online" id="canPost" v-model="newAccount.admin"> <label for="canPost"> Kann Accounts erstellen</label>
                        </div>
                        <div class="col-md mb-3">
                            <input type="checkbox" :disabled="!online" id="admin" v-model="newAccount.permissions.post"> <label for="admin"> Kann Einträge erstellen</label>
                        </div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="col-md-12">
                        <button type="submit" :disabled="!online" class="btn btn-info">Erstellen</button>
                    </div>
                </div>
            </form>
            <hr/>
        </div>

        <div class="m-3">
            <button class="btn btn-danger" @click="logout">Ausloggen</button>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';
    import Swal from 'sweetalert2';
    import * as env from '../assets/env';
    import { post, reset } from '../assets/cache.js';
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-info mr-1',
            cancelButton: 'btn btn-secondary'
        },
        buttonsStyling: false
    });

    export default {
        name: "AccountView",
        props: ['user', 'online'],
        methods: {
            createAccount(event){
                axios.post(env.backend_url + '/createAccount', {token: localStorage.getItem('token'), account: this.newAccount})
                .then(({data}) => {
                    if(data.success){
                        swalWithBootstrapButtons.fire('Account erstellt', 'Account wurde erstellt', 'success');
                        this.newAccount = {username: '',
                            password: '',
                            publicity: '',
                            admin: false,
                            permissions: {
                                post: false
                            }};
                        this.refreshUsers();
                    }else{
                        swalWithBootstrapButtons.fire('Fehler', 'Irgendetwas lief schief.', 'error');
                    }

                });
                event.preventDefault();
            },
            refreshUsers(){
                post(env.backend_url + '/getAllUsers', {token:localStorage.getItem('token')})
                    .then(({data}) => {
                        this.users = data.users;
                    })
            },
            deleteAccount(user){
                swalWithBootstrapButtons.fire({
                    title: 'Sicher?',
                    text: "Sicher das du den Account " + user.username + " löschen willst?",
                    icon: 'warning',
                    showCancelButton: true,
                    cancelButtonText: "Nein",
                    confirmButtonText: "Ja",
                }).then((result) => {
                    if (result.value) {
                        axios.post(env.backend_url + '/deleteAccount', {token: localStorage.getItem('token'), accountToDelete: user})
                            .then(({data}) => {
                                if(data.success){
                                    swalWithBootstrapButtons.fire('Account entfernt', 'Der Account wurde gelöscht', 'success');
                                    this.refreshUsers();
                                }else{
                                    swalWithBootstrapButtons.fire('Fehler', 'Irgendetwas lief schief.', 'error');
                                }
                            })
                    }
                })
            },
            async logout(){
              localStorage.clear();
              await reset();
              window.location.reload(true);
            },
            getPublicityString(publicity){
                switch (publicity) {
                    case 'public':
                        return 'Öffentlich';
                    case 'extended':
                        return 'Entferntere Verwandschaft';
                    case 'close':
                        return 'Nähere Verwandschaft';
                    case 'family':
                        return 'Familie';
                }
            }
        },
        data(){
            return {
                newAccount: {
                    username: '',
                    password: '',
                    publicity: '',
                    admin: false,
                    permissions: {
                        post: false
                    }
                },
                users: []
            }
        },
        watch: {
            user(){
                if(this.user && this.user.admin){
                    this.refreshUsers();
                }
            }
        },
        mounted() {
            if(this.user && this.user.admin){
                this.refreshUsers();
            }
        }
    }
</script>

<style scoped>

</style>
