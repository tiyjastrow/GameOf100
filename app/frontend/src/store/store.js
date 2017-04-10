import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        stage: "login", // manage views (login, connecting, bidding, reduce, play, end)
        username: '' // username the player picks
    }
});

export default store;