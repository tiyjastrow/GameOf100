import Vue from 'vue';
import Vuex from 'vuex';

import Player from '../models/Player';

Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        stage: "login", // manage views (login, connecting, bidding, reduce, play, end)
        username: '', // username the player picks
        players: {
            1: new Player(1),
            2: new Player(2),
            3: new Player(3),
            4: new Player(4)
        }
    }
});