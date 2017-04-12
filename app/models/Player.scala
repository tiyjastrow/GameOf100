package models

class Player (val number: Int) {
    var name: String = "Player " + this.number

    var hand: List[Card] = _
    var claimed: Boolean = false

    def claimedBy(username: String): Unit = {
        this.name = username
        this.claimed = ! this.claimed
    }
}
