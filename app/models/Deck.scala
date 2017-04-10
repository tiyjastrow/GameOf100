package models

import scala.util.Random

sealed trait Suit { def suit: Option[String] }
case object Diamonds extends Suit { val suit = Some("diamonds") }
case object Hearts extends Suit { val suit = Some("hearts") }
case object Spades extends Suit { val suit = Some("spades") }
case object Clubs extends Suit { val suit = Some("clubs") }
case object NoSuit extends Suit {val suit = None }

sealed trait Rank { def rank: String }
case object Ace extends Rank { val rank = "ace" }
case object Two extends Rank { val rank = "two" }
case object Three extends Rank { val rank = "three" }
case object Four extends Rank { val rank = "four" }
case object Five extends Rank { val rank = "five" }
case object Six extends Rank { val rank = "six" }
case object Seven extends Rank { val rank = "seven" }
case object Eight extends Rank { val rank = "eight" }
case object Nine extends Rank { val rank = "nine" }
case object Ten extends Rank { val rank = "ten" }
case object Jack extends Rank { val rank = "jack" }
case object Queen extends Rank { val rank = "queen" }
case object King extends Rank { val rank = "king" }
case object Joker extends Rank { val rank = "joker" }


case class Card(suit: Suit, rank: Rank)

class Deck (val cards: List[Card]) {

    def shuffle: Deck = Deck(Random.shuffle(this.cards))

    def deal(amount: Int): (List[Card], Deck) = {
        val (dealt, remaining) = this.cards.splitAt(amount)
        (dealt, Deck(remaining))
    }
}

object Deck {
    val suits = List(Diamonds, Hearts, Spades, Clubs)
    val ranks = List(Ace, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Jack, Queen, King)

    def apply(cards: List[Card] = Card(NoSuit, Joker) :: (for (s <- suits; r <- ranks) yield Card(s, r))): Deck = new Deck(cards)
}
