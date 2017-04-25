<template>
    <form @submit.prevent="submitLogin">
        <input type="text" v-model="loginForm.username" placeholder="Enter your username" required>
        <label> Games
            <select v-model="loginForm.gameName" required>
                <option selected disabled value="">Choose a game</option>
                <option v-for="game in state.games">{{game.name}}</option>
            </select>
        </label>
        <button type="submit">Join Game</button>
        <p v-if="error">{{errorMsg}}</p>
    </form>
</template>

<script>
    import Form from '../models/Form';
    import state from '../state/state';
    import update from '../state/update';

    export default {
        data() {
            return {
                state,
                loginForm: new Form({
                    username: state.username,
                    gameName: ''
                }),
                error: false,
                errorMsg: ''
            };
        },
        created() {
            update.updateGameList();
        },
        methods: {
            submitLogin() {
                this.error = false;
                this.loginForm.submit('/game')
                    .then(data => {
                        state.username = data.username;
                        state.gameName = data.gameName;
                        state.user = state.players[data.userNumber];
                        update.notifyConnected(); // moved from connecting.vue to notify before getConnections is run
                        state.stage = "connecting";
                    })
                    .catch(errorMsg => {
                        this.errorMsg = errorMsg;
                        this.error = true;
                    });
            }
        }
    };

</script>