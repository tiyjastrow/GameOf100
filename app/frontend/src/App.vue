<template>
<component :is="store.state.stage"></component>
</template>

<script>
    import login from './views/login.vue';
    export default {
        name: 'app',
        components: {
            'login': login
        }
    }
</script>
