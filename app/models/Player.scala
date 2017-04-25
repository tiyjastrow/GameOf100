package models

import play.api.libs.json.Json

case class Player (number: Int) {
    var name: String = "Player " + this.number

    var hand: List[Card] = _
    var bid: Int = 0
    var claimed: Boolean = false
    var connected: Boolean = false

    def claimedBy(username: String): Unit = {
        this.name = username
        this.claimed = ! this.claimed
    }

    def setConnected(): Unit = this.connected = true

    def setBid(bid: Int) = this.bid = bid
}

object Player {
    implicit val playerWrites = Json.writes[Player]
}
