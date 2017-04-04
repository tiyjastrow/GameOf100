class Player {
    constructor(number) {
        this.number = number;
        this.name = "Player " + number;
        this.connected = false;
        this.bid = 0;
    }
}

class Card {
    constructor(name, rank, suit) {
        this.name = name;
        this.rank = rank;
        this.suit = suit;
    }
}

class Form {
    constructor(data) {
        this.originalData = data;
        for (let field in data) {
            this[field] = data[field];
        }
        this.errors = new Errors();
    }

    getData() {
        let data = Object.assign({}, this);
        delete data.originalData;
        delete data.errors;
        return data;
    }

    submit(url, params) {
        var data = this.getData();
        if (params) {
            data = {params: params, data: data};
        }
        return new Promise((resolve, reject) => {
            axios.post(url, data)
                .then(response => {
                    this.onSuccess(response.data);
                    resolve(response.data);
                })
                .catch(error => {
                    this.onFail(error.data);
                    reject(error.data);
                });
        });
    }

    onSuccess(data) {
        this.reset();
    }

    onFail(errors) {
        this.errors.record(errors);
    }

    reset() {
        for (let field in this.originalData) {
            this[field] = '';
        }
        this.errors.clear();
    }
}

class Errors {
    constructor() {
        this.errors = {};
    }

    has(field) {
        return this.errors.hasOwnProperty(field);
    }

    any() {
        return Object.keys(this.errors).length > 0;
    }

    get(field) {
        if (this.errors[field]) {
            return this.errors[field];
        }
    }

    record(errors) {
        this.errors = errors;
    }

    // $event.target.name gives field that they type in
    clear(field) {
        if (field) {
            delete this.errors[field];
        } else {
            this.errors = {};
        }
    }
}

const globalData = {
    stage: "login",
    players: {
        1: new Player(1),
        2: new Player(2),
        3: new Player(3),
        4: new Player(4)
    },
    name: "Matthew",
    game: "",
    user: undefined,
    leader: undefined,
    trump: 0,
    currentPlayerTurn: undefined
};

Vue.component('cheat-sheet', {
    template: `
    <div v-once class="col-md-2" style="background-color: black; opacity: 0.5; color: white">
        <h4>Cheat Sheet</h4>
        Ace: 1<br>
        King/Opposite King: 25<br>
        Queen: 0<br>
        Jack/Opposite Jack: 1<br>
        10: 1<br>
        9/Opposite 9: 9<br>
        5/Opposite 5: 5<br>
        2: 1<br>
        Joker: 17<br>
        All Other Cards: 0
    </div>
    `
});

Vue.component('banner', {
    props: {
        player: {
            type: Player,
            required: true
        }
    },
    template: `
    <div class="col-md-4 col-md-offset-2" style="margin-top: 100px">
        <div class="col-md-12" style="background-color: black; opacity: 0.5; color: white">
            <h3>Stage: {{ stage }}</h3>
        </div>
        <div class="col-md-12" style="background-color: black; opacity: 0.5; color: white; margin-top: 10px">
            <h4>{{ stageMessage }}</h4>
        </div>
    </div>
    `,
    data: function() {
        return {
            stage: this.$root.$data.global.stage
        };
    },
    computed: {
        stageMessage: function() {
            if (this.stage === "bidding") {
                return 'Current Bidder: ' + this.player.name;
            } else if (this.stage === "reduce") {
                return 'Cat Winner: ' + this.player.name;
            }
        }
    }
});

Vue.component('scoreboard', {
    template: `
    <div>
        <div style="margin-left: 10px">
            <table style="display: inline-block">
                <tr><th>Team 1</th></tr>
                <tr><td>{{team1Score}}</td></tr>
            </table>

            <table style="display: inline-block; margin-left: 70px">
                <tr><th>Team 2</th></tr>
                <tr><td>{{team2Score}}</td></tr>
            </table>
        </div>

        <table>
            <tr>
                <th>Team 1</th>
                <th>Bid Info</th>
                <th>Team 2</th>
            </tr>
            <tr v-for="round in runningScoreInfo">
                <td> {{round.team1}} </td>
                <td> <span v-if="round.bidTeam == 1" class="glyphicon glyphicon-arrow-left"></span> {{round.bid}} <span v-if="round.bidTeam == 2" class="glyphicon glyphicon-arrow-right"></span> </td>
                <td> {{round.team2}} </td>
            </tr>
        </table>
    </div>
    `,
    data: function() {
        return {
            team1Score: 0,
            team2Score: 0,
            runningScoreInfo: undefined,
            scoreboardCheck: undefined // used to stop timeout on destroy
        };
    },
    mounted: function() {
        this.getScoreboard();
    },
    beforeDestroy: function() {
        clearTimeout(this.scoreboardCheck);
    },
    methods: {
        getScoreboard: function() {
            axios.get('/scoreboard', {params: {game: this.$root.$data.global.game}})
                .then(response => {
                    this.team1Score = response.data.team1Score;
                    this.team2Score = response.data.team2Score;
                    this.runningScoreInfo = response.data.runningScoreInfo;
                });
            this.scoreboardCheck = setTimeout(this.getScoreboard, 5000);
        }
    }
});

Vue.component('bid-grid', {
    props: ['players', 'currentBidder'],
    template: `
    <div class="col-md-4 col-md-offset-4">
        <bid-box v-for="player in players" :player="player" :currentBidder="currentBidder" ></bid-box>
    </div>
    `
});

Vue.component('bid-box', {
    props: ['player', 'currentBidder'],
    template: `
    <div class="col-md-6">
        {{ player.name }}
        <h1>{{ bidText }}</h1>
        <div v-if="myTurn">
            <form action="/bid" method="post" @submit.prevent="submitBid">
                <p>{{bidForm.bid}}</p>
                <input type="number" :min="player.bid" v-model="bidForm.bid">
                <button type="submit" :disabled="unclickable" >Bid</button>
            </form>
            <button @click="pass" :disabled="unclickable" >Pass</button>
        </div>
    </div>
    `,
    computed: {
        myTurn() {
            return (this.player == this.currentBidder) && (this.player == this.$root.$data.global.user);
        },
        bidText() {
            if (this.player.bid === 0) {
                return "--";
            } else if (this.player.bid == -1) {
                return "pass";
            } else {
                return this.player.bid;
            }
        }
    },
    data: function() {
        return {
            bidForm: new Form({
                bid: 0
            }),
            unclickable: false
        };
    },
    methods: {
        submitBid: function() {
            this.unclickable = true;
            // ajax found in Form class submit(route, params)
            this.bidForm.submit("/bid", {game: this.$root.$data.global.game, player: this.$root.$data.global.user.number})
                .catch(error => {
                    this.unclickable = false;
                });
        },
        pass: function() {
            this.bidForm.bid = -1;
            this.submitBid();
        }
    }
});

Vue.component('hand', {
    template: `
    <div class="row" style="position: absolute; bottom: 0px; width: 1200px">
        <div class="col-md-10 col-md-offset-1" style="background-color: green; padding: 10px 0px 10px 0px">
            <div v-if="reduce">
                <img v-for="card in hand" :class="[card.name, {discard: inDiscard(card)}]" class="card clickable" @click="addToDiscard(card)">
                <button :disabled="discardIsEmpty" @click="discard">Discard</button>
            </div>

            <img v-if="bidding" v-for="card in hand" :class="card.name" class="card">

            <div v-if="play">
                <div v-if="myTurn">
                    <img v-for="card in hand" :class="[card.name, {play: chosenCard(card)}]" class="card clickable" @click="chooseToPlay(card)">
                    <button :disabled="cardToPlay == undefined" @click="playCard">Play</button>
                </div>

                <img v-else v-for="card in hand" :class="card.name" class="card">
            </div>
        </div>
    </div>
    `,
    data: function() {
        return {
            hand: [],
            global: this.$root.$data.global,
            discardPile: [],
            cardToPlay: undefined
        };
    },
    mounted: function() {
        axios.get('/hand', {params: {game: this.$root.$data.global.game, player: this.$root.$data.global.user.number}})
            .then(response => {
                this.loadHand(response.data.hand);
            });
        if (this.global.stage == "play") {
            this.getTurn();
        }
    },
    methods: {
        inDiscard: function(card) {
            return this.discardPile.find(c => c === card);
        },
        chosenCard: function(card) {
            return this.cardToPlay === card;
        },
        addToDiscard: function(card) {
            var index = this.discardPile.indexOf(card);
            if (index > -1) {
                this.discardPile.splice(index, 1);
            } else {
                this.discardPile.push(card);
            }
        },
        discard: function() {
            this.discardPile = [];
            axios.post('/discard',
                {
                    params: {
                        game: this.global.game,
                        player: this.global.user.number
                    },
                    data: this.discardPile
                })
                .then(response => {
                    this.loadHand(response.data.hand);
                });
        },
        loadHand: function(hand) {
            this.hand = [];
            hand.forEach(card => {
                this.hand.push(new Card(card.name, card.rank, card.suit));
            });
        },
        getTurn: function() {

        },
        chooseToPlay: function(card) { // add to card to play unless the card is already there, remove instead
            if (this.cardToPlay == card) {
                this.cardToPlay = undefined;
            } else {
                this.cardToPlay = card;
            }
        },
        playCard: function() {
            if (this.cardToPlay !== undefined) {
                axios.post('/play-card',
                    {
                        params: {
                            game: this.global.game,
                            player: this.global.user.number
                        },
                        data: this.cardToPlay
                    })
                    .then(response => {
                        var index = this.hand.indexOf(this.cardToPlay);
                        this.hand.splice(index, 1);
                        this.cardToPlay = undefined;
                    })
                    .catch(error => {
                        this.cardToPlay = undefined;
                    });
            }
        }
    },
    computed: {
        discardIsEmpty: function() {
            return this.discardPile.length === 0;
        },
        bidding: function() {
            return this.global.stage == "bidding";
        },
        reduce: function() {
            return this.global.stage == "reduce";
        },
        play: function() {
            return this.global.stage == "play";
        },
        myTurn: function() {
            return this.global.currentPlayerTurn == this.global.user;
        }
    }
});

Vue.component('cat', {
    template: `
    <div class="col-md-6 col-md-offset-3" style="background-color: cyan">
        <img v-for="card in cat" :class="card.name" class="card">
    </div>
    `,
    mounted: function() {
        axios.get('/cat', {params: {game: this.$root.$data.global.game}})
            .then(response => {
                response.data.cat.forEach(card => {
                    this.cat.push(new Card(card.name, card.rank, card.suit));
                });
            });
    },
    data: function() {
        return {
            cat: []
        };
    }
});

Vue.component('play', {
    template: `
    <div class="row">
        <div class="col-md-4 col-md-offset-4">
            <img :class="play[0].name" class="card"><br>
            <img :class="play[1].name" class="card" style="display: inline-block">
            <img class="trump clubs" style="display: inline-block; margin: 10px; position: relative">
            <h4 style="position: absolute; top: 150px; left: 0; width: 100%">
                <span style="background-color: white; padding: 2px">
                    {{score}}
                </span>
            </h4>
            <img :class="play[2]" class="card" style="display: inline-block"><br>
            <img :class="play[3]" class="card">
        </div>
    </div>
    `,
    data: function() {
        return {
            score: 0,
            play: {
                0: new Card(),
                1: new Card(),
                2: new Card(),
                3: new Card()
            },
            playCheck: undefined
        };
    },
    mounted: function() {
        this.getPlay();
    },
    beforeDestroy: function() {
        clearTimeout(this.playCheck);
    },
    methods: {
        getPlay: function() {
            axios.get('/play', {params: {game: this.$root.$data.global.game}})
                .then(response => {
                    var play = response.data.play;
                    for (var card in play) {
                        this.play[card].name = play[card].name;
                    }
                    this.score = response.data.score;
                });
            this.playCheck = setTimeout(this.getPlay, 5000);
        }
    }
});

var loginComp = {
    template: `
    <form class="form-horizontal" style="margin-top: 100px" @submit.prevent="joinGameSubmit">
        <div class="form-group">
            <label for="username" class="col-md-1 col-md-offset-2 control-label">Name</label>
            <div class="col-md-6">
                <input type="text" class="form-control" v-model="joinGame.name" placeholder="Enter a unique name" required>
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
    `,
    data: function() {
        return {
            games: [],
            global: this.$root.$data.global,
            joinGame: new Form({
                name: this.$root.$data.global.name,
                game: ''
            })
        };
    },
    mounted: function() {
        axios.get('/games')
            .then(response => {
                this.games = response.data;
            });
    },
    methods: {
        joinGameSubmit: function() {
            this.joinGame.submit("/join-game")
                .then(data => {
                    this.global.user = this.global.players[data.user];
                    this.global.name = data.name;
                    this.global.game = data.game;
                    this.global.stage = "connecting";
                });
        }
    }
};

var connectingComp = {
    template: `
        <div class="container">
            <h1 v-for="player in global.players">{{player.name}}: {{player.connected}}</h1>
        </div>
    `,
    data: function() {
        return {
            connectCheck: undefined,
            global: this.$root.$data.global
        };
    },
    mounted: function() {
        axios.post('/connected', {params: {game: this.global.game, player: this.global.user.number}});
        this.updateConnection();
    },
    beforeDestroy: function() {
        // clear timeout started on mount found in updateConnection
        clearTimeout(this.connectCheck);
    },
    methods: {
        updateConnection: function() {
            axios.get('/players', {params: {game: this.global.game}})
                .then(response => {
                    response.data.forEach(player => {
                        var currentPlayer = this.global.players[player.number];
                        currentPlayer.name = player.name;
                        currentPlayer.connected = player.connected;
                    });
                });
            this.connectCheck = setTimeout(this.updateConnection, 5000);
        }
    },
    computed: {
        numberConnected: function() {
            var players = this.global.players;
            var count = 0;
            for (var key in players) {
                // skip loop if the property is from prototype
                if (!players.hasOwnProperty(key)) continue;

                if (players[key].connected) {
                    count++;
                }
            }
            return count;
        }
    },
    watch: {
        numberConnected: function() {
            if (this.numberConnected >= 4) {
                this.global.stage = "bidding";
            }
        }
    }
};

var biddingComp = {
    template: `
    <div class="container">
        <div class="row">
            <cheat-sheet></cheat-sheet>
            <banner :player="currentBidder"></banner>
            <scoreboard></scoreboard>
        </div>
        <div class="row">
            <bid-grid :players="global.players" :currentBidder="currentBidder"></bid-grid>
        </div>
        <hand></hand>
    </div>
    `,
    data: function() {
        return {
            global: this.$root.$data.global,
            currentBidder: this.$root.$data.global.players[1],
            bidCheck: undefined, // to clear timeout before destroy
        };
    },
    mounted: function() {
        this.updateBid();
    },
    beforeDestroy: function() {
        // clear timeout started on mount found in updateBid
        clearTimeout(this.bidCheck);
    },
    methods: {
        updateBid: function() {
            axios.get('/bid-info', {params: {game: this.global.game}})
                .then(response => { // response data should have player bids, current bidder, winning bidder, winning bid
                    if (response.data.hasOwnProperty("winner")) {
                        // set leader from bid winner
                        this.global.leader = this.global.players[response.data.winner];
                        this.global.stage = "reduce";
                        return;
                    }

                    this.currentBidder = this.global.players[response.data.currentBidder];
                    response.data.playerBids.forEach(player => {
                        this.global.players[player.number].bid = player.bid;
                    });
                });
            this.bidCheck = setTimeout(this.updateBid, 5000);
        }
    },
};

var reduceComp = {
    template: `
        <div class="container">
            <div class="row">
                <cheat-sheet></cheat-sheet>
                <banner :player="global.leader"></banner>
                <scoreboard></scoreboard>
            </div>
            <div class="row">
                <cat></cat>
            </div>
            <hand></hand>
            <button @click="postReady" :disabled="ready">Ready</button>
        </div>
    `,
    data: function() {
        return {
            global: this.$root.$data.global,
            ready: false,
            waitCheck: undefined, // for clearing timeout on destroy
        };
    },
    methods: {
        postReady: function() {
            axios.post('/ready', {params: {game: this.global.game, player: this.global.user.number}})
                .then(response => {
                    this.ready = true;
                    this.waitForOthers();
                });
        },
        waitForOthers: function() {
            axios.get('/ready', {params: {game: this.global.game}})
                .then(response => {
                    if (response.data.ready) {
                        this.global.stage = "play";
                        return;
                    }
                });
            this.waitCheck = setTimeout(this.waitForOthers, 5000);
        }
    },
    beforeDestroy: function() {
        clearTimeout(this.waitCheck);
    }
};

var playComp = {
    template: `
        <div class="container">
            <div class="row">
                <cheat-sheet></cheat-sheet>
                <scoreboard></scoreboard>
            </div>
            <play></play>
            <hand></hand>
        </div>
    `,
    data: function() {
        return {
            global: this.$root.$data.global,
            turnCheck: undefined
        };
    },
    mounted: function() {
        this.getTurn();
    },
    beforeDestroy: function() {
        clearTimeout(this.turnCheck);
    },
    methods: {
        getTurn: function() {
            axios.get('/player-turn', {params: {game: this.global.game}}) // handles player turn and whether the play round is over
                .then(response => {
                    if (response.data.roundOver) {
                        this.global.stage = "end";
                        return;
                    }
                    var playerNumber = response.data.player;
                    this.global.currentPlayerTurn = this.global.players[playerNumber];
                });
            this.turnCheck = setTimeout(this.getTurn, 5000);
        }
    }
};

var endComp = { // if end of game to login stage, if end of round to connecting stage
    template: `
    <div>
        <button v-if="endOfGame" @click="newGame" >New Game</button>
        <button v-else @click="nextRound" >Next Round</button>
    </div>
    `,
    data: function() {
        return {
            endOfGame: false,
            global: this.$root.$data.global
        };
    },
    mounted: function() {
        axios.get('/round-info', {params: {game: this.global.game}})
            .then(response => {
                this.endOfGame = response.data.endOfGame;
            });
    },
    methods: {
        newGame: function() {
            axios.post('/new-game', {params: {game: this.global.game, player: this.global.user.number}});
        },
        nextRound: function() {
            axios.post('/next-round', {params: {game: this.global.game, player: this.global.user.number}});
        }
    }
};
// need to figure out how to handle reconnect on next round and not letting new people join
new Vue({
    el: '#root',
    data: {
        global: globalData
    },
    components: {
        login: loginComp,
        connecting: connectingComp,
        bidding: biddingComp,
        reduce: reduceComp,
        play: playComp,
        end: endComp
    }
});
