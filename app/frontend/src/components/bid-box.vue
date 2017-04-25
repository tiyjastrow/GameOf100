<template>

    <div>
        <h1>{{player.name}}</h1>
        <h4>{{bid}}</h4>
        <div v-if="myTurn">
            <input type="number">
            <button>Bid</button>
        </div>
    </div>

</template>

<script>

    import state from '../state/state';

    export default {
        props: ['player', 'turn'],
        data() {
            return {
                state
            };
        },
        computed: {
            bid() {
                if (this.player.bid === 0) {
                    return "--";
                } else if (this.player.bid === -1) {
                    return "Pass";
                } else {
                    return this.player.bid;
                }
            },
            myTurn() {
                return (this.player == this.turn) && (this.player == this.state.user);
            }
        }
    }

</script>