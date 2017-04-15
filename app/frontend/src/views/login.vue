<template>
    <form @submit.prevent="submitLogin">
        <input type="text" v-model="loginForm.username" placeholder="Enter your username" required>
        <label> Games
            <select v-model="loginForm.gameName" required>
                <option selected disabled>Choose a game</option>
                <option v-for="game in state.games">{{game}}</option>
            </select>
        </label>
        <button type="submit">Join Game</button>
    </form>
</template>

<script>
    import Form from '../models/Form';
    import state from '../state/state'

    export default {
        data() {
            return {
                state,
                loginForm: new Form({
                    username: state.username,
                    gameName: ''
                })
            };
        },
        methods: {
            submitLogin() {
                console.log('form submitted');
            }
        }
    };

</script>