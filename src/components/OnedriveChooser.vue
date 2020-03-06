<template>
    <button @click="open" class="btn btn-info w-100" type="button"><i class="fab fa-windows"></i> aus dem Drive</button>
</template>

<script>
    import Swal from 'sweetalert2';
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-info mr-1',
            cancelButton: 'btn btn-secondary'
        },
        buttonsStyling: false
    });

    export default {
        name: "DropboxChooser",
        methods: {
            open: function(event){
                event.preventDefault();
                swalWithBootstrapButtons.fire(
                    'Leider noch nicht implementiert.',
                    'A helicopter was flying around above Seattle when an electrical malfunction disabled all of the aircraft\'s electronic navigation and communications qquipment. Due to the clouds and haze, the pilot could not determine the helicopter\'s position and course to fly to the airport. The pilot saw a tall building, flew toward it, circled, drew a handwritten sign, and held it in the helicopter\'s window. The pilot\'s sign said "WHERE AM I?" in large letters. People in the tall building quickly responded to the aircraft, drew a large sign and held it in a building window. Their sign read: "YOU ARE IN A HELICOPTER." The pilot smiled, waved, looked at her map, determined the course to steer to SEATAC airport, and landed safely. After they were on the ground, the co-pilot asked the pilot how the "YOU ARE IN A HELICOPTER" sign helped determine their position. The pilot responded "I knew that had to be the Microsoft building because, like their technical support, online help and product documentation, the response they gave me was technically correct, but completely useless."',
                    'error'
                )
            }
        }
    }
</script>

<style scoped>

</style>