<template>
    <div>
        <div v-for="player in state.players">
            <h4>{{player.name}}</h4>
            <h6>Connected: {{player.connected}}</h6>
        </div>
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
        mounted() {
            update.getConnections();
        },
        computed: {
            connectedPlayers() {
                let players = this.state.players;
                let count = 0;
                for (let key in players) {
                    if (players.hasOwnProperty(key)) {
                        if (players[key].connected) {
                            count++;
                        }
                    }
                }
                return count;
            }
        },
        watch: {
            connectedPlayers(number) {
                if (number >= 4) {
                    this.state.stage = "bidding";
                }
            }
        }
    }

</script>