<template>
    <nav class="navbar bg-info navbar-dark position-sticky text-light">
        <a v-if="!mobile" class="navbar-brand text-light" href="/">
            Familie Wenzel
            <small v-if="!online" class="text-dark">offline</small>
        </a>
        <a v-if="mobile" class="navbar-brand text-light" href="/">
            Wenzel
            <small v-if="!online" class="text-dark">offline</small>
        </a>
        <router-link to="/"><i class="fa fa-images text-light"></i><span v-if="!mobile" class="text-light"> Alle Bilder</span></router-link>
        <span>|</span>
        <router-link to="/alben/"><i class="fa fa-folder text-light"></i><span v-if="!mobile" class="text-light"> Alben</span></router-link>
        <span v-if="user && user.permissions && user.permissions.post">|</span>
        <router-link to="/neuer-beitrag/" v-if="user && user.permissions && user.permissions.post"><i class="fa fa-plus text-light"></i>
            <span v-if="!mobile" class="text-light"> neuer Eintrag</span>
        </router-link>
        <Login v-if="!user" @login="login" />
        <router-link  v-if="user" to="/account/">
            <ProfileInfo v-bind="user" />
        </router-link>
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
        props: ['user', 'mobile', 'online'],
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
        left: 0;
        z-index: 100;
        width: 100vw;
        max-width:100%;
    }
</style>
