<template>

    <div>
        <div v-for="player in state.players">
            <bid-box :player="player" :turn="state.currentTurn"></bid-box>
        </div>

        <div>
            <hand></hand>
        </div>
    </div>

</template>

<script>
    import state from '../state/state';
    import update from '../state/update';
    import hand from '../components/hand.vue';
    import bidBox from '../components/bid-box.vue';

    export default {
        data() {
            return {
                state
            }
        },
        created() {
            update.getTurn();
        },
        components: {
            hand,
            'bid-box': bidBox
        }
    }

</script>