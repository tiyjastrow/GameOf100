<template>
    <component :is="this.$store.state.stage"></component>
</template>

<script>
    import login from './views/login.vue';
    import connecting from './views/connecting.vue';

    export default {
        name: 'app',
        components: {
            'login': login,
            'connecting': connecting
        }
    }
</script>
