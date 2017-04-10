package models

class Game (val name: String) {
    val player1 = Player(1)
    val player2 = Player(2)
    val player3 = Player(3)
    val player4 = Player(4)

    val players = List(player1, player2, player3, player4)

    var trump: Suit = NoSuit
    var cat: List[Card] = List()
    var play: List[Card] = List()
    val scoreboard: Scoreboard = new Scoreboard()

    def deal(): Unit = {
        val deck = Deck().shuffle
        players.foreach(player => {
            player.hand = deck.deal(12)
        })
        cat = deck.deal(5)
    }
}
