<template>
    <form class="form-horizontal" style="margin-top: 100px" @submit.prevent="joinGameSubmit">
        <div class="form-group">
            <label class="col-md-1 col-md-offset-2 control-label">Name</label>
            <div class="col-md-6">
                <input type="text" class="form-control" v-model="joinGame.username" placeholder="Enter a unique name" required>
            </div>
        </div>
        <div class="form-group">
            <label class="col-md-1 col-md-offset-2 control-label">Games</label>
            <div class="col-md-6">
                <select class="form-control"  v-model="joinGame.game" required>
                    <option selected disabled value="">Choose a game</option>
                    <option v-for="game in games"> {{ game }} </option>
                </select>
            </div>
        </div>
        <div class="form-group">
            <div class="col-md-1 col-md-offset-8">
                <button class="btn btn-default" type="submit">Join Game</button>
            </div>
        </div>
    </form>
</template>

<script>
import Form from '../models/Form';
import axios from 'axios';


export default {
    data() {
        return {
            games: [],
            joinGame: new Form({
                username: this.$store.state.username,
                game: ''
            })
        };
    },
    mounted() {
        axios.get('/games')
            .then(response => {
                this.games = response.data;
            });
    },
    methods: {
        joinGameSubmit() {
            this.joinGame.submit("/join-game")
                .then(data => {
                    this.$store.state.user = this.$store.state.players[data.user];
                    this.$store.state.username = data.username;
                    this.$store.state.game = data.game;
                    this.$store.state.stage = "connecting";
                });
        }
    }
}
</script>