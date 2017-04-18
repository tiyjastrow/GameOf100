import axios from 'axios';
import state from './state';

const update = {

    updateGameList() {
        axios.get('/games')
            .then(({data}) => {
                state.games = data;
            });
    },

    notifyConnected() {
        axios.post('/connected', {gameName: state.gameName, playerNumber: state.user.number});
    },

    getConnections() {
        axios.get('/players', {params: {gameName: state.gameName}})
            .then(({data}) => {
                data.forEach(player => {
                    state.players[player.number].name = player.name;
                    state.players[player.number].connected = true;
                })
            });
    },

    getHand() {
        axios.get('/hand', {params: {gameName: state.gameName, playerNumber: state.user.number}})
            .then(({data}) => {
                state.hand = data;
            })
    },

    getTurn() {
        axios.get('/player', {params: {gameName: state.gameName}})
            .then(({data}) => {
                state.turn = state.players[data.playerNumber];
            });
    }
};

export default update;