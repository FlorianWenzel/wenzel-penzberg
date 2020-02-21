<template>
    <div>
        <button class="btn btn-light" @click="showLoginModal">Einloggen</button>
    </div>
</template>

<script>
    import Swal from 'sweetalert2'
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false
    });
    export default {
        name: "Login",
        methods: {
            showLoginModal() {
                swalWithBootstrapButtons.fire({
                    title: 'Benutzername:',
                    input: 'text',
                    showCancelButton: true,
                    confirmButtonText: 'Einloggen',
                    cancelButtonText: 'Abbrechen',
                    showLoaderOnConfirm: true
                })
            }
        }
    }
</script>

<style scoped>

</style>