package models

case class Player (number: Int) {
    var name: String = "Player " + this.number

    var hand: List[Card] = _
}
