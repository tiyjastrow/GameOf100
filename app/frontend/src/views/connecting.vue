<template>

    <div>
        <h1 v-for="player in players">{{player.name}}: {{player.connected}}</h1>
    </div>

</template>

<script>
    import axios from 'axios';
    import { mapGetters } from 'vuex'

    export default {
        data() {
            return {
                players: this.$store.state.players
            };
        },
        mounted() {
            axios.post('/connected', {params: {game: this.$store.state.game, player: this.$store.state.user.number}});
        },
        computed: mapGetters({'numOfConnectedPlayers': 'connectedPlayers'}),
        watch: {
            connectedPlayers(number) {
                if (number >= 4) {
                    this.$store.commit('setStage', 'bidding');
                }
            }
        }
    }

</script>