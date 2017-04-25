<template>
    <div>
        <img v-for="card in state.hand" :class="card.name" class="card">
    </div>
</template>

<script>

    import state from '../state/state';
    import update from '../state/update';

    export default {
        data() {
            return {
                state
            };
        },
        created() {
            update.getHand();
        }
    }

</script>