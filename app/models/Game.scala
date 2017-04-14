package models

class Game(val name: String) {
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
        players.foreach(_.hand = deck.deal(12))
        cat = deck.deal(5)
    }

    def joinGame(username: String): Option[Int] = {
        players.find(!_.claimed) match {
            case Some(player) => player.claimedBy(username); Some(player.number) // Claim player and return player #
            case None => None // Do nothing and return None
        }
    }

    def connected(playerNumber: Int): Unit = this.players(playerNumber - 1).setConnected()
}
