import axios from 'axios';
import state from './state';

const update = {

    updateGameList() {
        axios.get('/games')
            .then(({data}) => {
                state.games = data;
            });
    }

};

export default update;