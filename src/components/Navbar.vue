<template>
    <nav class="navbar bg-info navbar-dark">
        <a class="navbar-brand">Familie Wenzel</a>

        <Login v-if="!user" @login="login"></Login>
        <ProfileInfo v-if="user" v-bind="user"></ProfileInfo>
    </nav>
</template>
<script>
    import Login from './Login.vue';
    import ProfileInfo from './ProfileInfo.vue';
    export default {
        name: 'Navbar',
        components: {
            Login,
            ProfileInfo
        },
        props: ['user'],
        methods: {
            login (data){
                this.$emit('login', data);
            }
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
