import Player from '../models/Player';

const state = {
    stage: "login",
    players: {
        1: new Player(1),
        2: new Player(2),
        3: new Player(3),
        4: new Player(4)
    },
    user: undefined,
    username: '',
    games: [],
    gameName: '',
    currentTurn: undefined,
    leader: undefined,
    hand: []
};

export default state;