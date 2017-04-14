<template>
    <form class="form-horizontal" @submit.prevent="joinGameSubmit">
        <input type="text" v-model="joinGame.username" placeholder="Enter a unique name" required>
        <label>Games
            <select v-model="joinGame.game" required>
                <option selected disabled value="">Choose a game</option>
                <option v-for="game in $store.state.games"> {{ game }}</option>
            </select>
        </label>
        <button type="submit">Join Game</button>
    </form>
</template>

<script>
    import Form from '../models/Form';
    import axios from 'axios';

    export default {
        data() {
            return {
                joinGame: new Form({
                    username: this.$store.state.username,
                    game: ''
                })
            };
        },
        mounted() {
            this.$store.dispatch('loadGames');
        },
        methods: {
            joinGameSubmit() {
                this.joinGame.submit("/game")
                    .then(data => {
                        this.$store.commit('setUser', data.user);
                        this.$store.commit('setUsername', data.username);
                        this.$store.commit('setGame', data.game);
                        this.$store.commit('setStage', 'connecting');
                    });
            }
        }
    }
</script>