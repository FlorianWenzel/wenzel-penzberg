<template>
    <nav class="navbar bg-info navbar-dark">
        <a class="navbar-brand">Familie Wenzel</a>
        <Login></Login>
    </nav>
</template>
<script>
    import Login from './Login.vue';
    export default {
        name: 'Navbar',
        components: {
            Login
        }
    }
</script>
<style scoped>
    nav {
        position: absolute;
        top: 0;
        width: 100vw;
    }
</style>
