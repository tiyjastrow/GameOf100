<template>
    <component :is="state.stage" ></component>
</template>

<script>
    import state from './state/state';
    import update from './state/update';
    import login from './views/login.vue';
    import connecting from './views/connecting.vue';
    import bidding from './views/bidding.vue';

    export default {
        name: 'app',
        data() {
            return {
                state
            };
        },
        components: {
            login,
            connecting,
            bidding
        },
        created() {
            setInterval(this.update, 5000);
        },
        methods: {
            update() {
                switch (this.state.stage) {
                    case "login":
                        update.updateGameList();
                        break;
                    case "connecting":
                        update.getConnections();
                        break;
                    case "bidding":
                        update.getTurn();
                        break;
                    case "reduce":
                        break;
                    case "play":
                        break;
                    case "end":
                        break;
                }
            }
        }
    }
</script>

