import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

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
        },
        user: undefined,
        game: '',
        games: []
    },
    getters: {
        stage: state => {
            return state.stage;
        },
        numOfConnectedPlayers: state => {
            let players = state.players;
            let count = 0;
            for (let key in players) {
                // skip loop if the property is from prototype
                if (!players.hasOwnProperty(key)) continue;

                if (players[key].connected) {count++;}
            }
            return count;
        }
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
        },
        setUsername(state, username) {
            state.username = username;
        },
        setGame(state, game) {
            state.game = game;
        },
        setStage(state, stage) {
            state.stage = stage;
        },
        updatePlayerConnection(state, player) {
            let playerTemp = state.players[player.number];
            playerTemp.name = player.name;
            playerTemp.connected = player.connected;
        }
    },
    actions: {
        loadGames({state}) {
            axios.get('/games')
                .then(({data}) => {
                    state.games = data;
                });
        },
        getConnections({state, commit, dispatch}) {
            if (state.stage != "connecting") {
                return;
            }
            axios.get('/players', {params: {game: state.game}})
                .then( ({ data }) => {
                    data.forEach(player => {
                        commit('updatePlayerConnection', player);
                    });
                });

            setTimeout(dispatch('getConnections'), 5000);
        },
        connected({state}) {
            axios.post('/connected', {params: {game: state.game, player: state.user.number}});
        }
    }

});