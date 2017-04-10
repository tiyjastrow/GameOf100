package models

import org.scalatestplus.play.PlaySpec

class DeckTest extends PlaySpec {
    "A deck" when {
        "new" should {
            "have 53 cards" in {
                val deck = Deck()
                deck.cards.length mustEqual 53
            }

            "be dealable" in {
                val deck = Deck()
                val hand = deck.deal(12)
                hand.length mustEqual 12
                deck.cards.length mustEqual 53 - 12
            }
        }
    }
}