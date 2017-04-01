import java.util
import java.util.function.Consumer

import models.{Card, Deck, Player}

import scala.collection.mutable
import scala.collection.mutable.ListBuffer

class Game {

  val player1 = new Player(1)
  val player2 = new Player(2)
  val player3 = new Player(3)
  val player4 = new Player(4)

  val deck = new Deck

  val bids = mutable.HashMap("player1" -> 0,
    "player2" -> 0,
    "player3" -> 0,
    "player4" -> 0)

  var cat = new ListBuffer[Card]
  var currentBidder = new Player
  var winningBidder = new Player
  var winningBid: Int = 61

  var leader = new Player
  var trump = 0
  var currentRound: Int = 1


  val allPlayers = ListBuffer(player1, player2, player3, player4)

  var activePlayers: ListBuffer[Player] = allPlayers

  var playerTurn: Int = 2

  def changeTurns(): Unit = {
    if (playerTurn < activePlayers.size) {
      playerTurn += 1
    } else {
      playerTurn = 1
    }
  }

  def deal(): Unit = {
    deck.create()
    player1.setHand(deck.deal(12))
    player2.setHand(deck.deal(12))
    player3.setHand(deck.deal(12))
    player4.setHand(deck.deal(12))
    cat = deck.deal(5).asInstanceOf
//    cat = for ( card <- deck.deal(5) ) yield card
//    deck.deal(5).asInstanceOf[Consumer[_ >: models.Card]].forEach((card: Card) => cat += card)
  }

  //if first 3 players bid -1, player 1 autobids 62 and wins bid todo: implement this comment if needed
  def evaluateBid(currentBidder: Player, bid: Int): Unit = {
    if (bid > winningBid) {
      winningBid = bid
      winningBidder = currentBidder
    }
    if (bid == -1) {
      activePlayers.-=(currentBidder)
    }
    changeTurns()
  }

  def setTrump(passedTrump: Int): Unit = {
    trump = passedTrump
  }

  def passCards(cards: ListBuffer[Card], targetPlayer: Player, passingPlayer: Player): Unit = {
    targetPlayer.addCards(cards.asInstanceOf)
    passingPlayer.removeCards(cards.asInstanceOf)
  }

  def checkIfTrumpOrOp(card: Card): Boolean = {
    val isOppositeRank = List(0, 5, 9, 11, 13).contains(card.getRank)
    val isBlackTrump = List(1, 4).contains(trump)
    (card.isJoker
      || (card.getSuit == trump)
      || (isOppositeRank && (isBlackTrump && card.isBlack) || (!isBlackTrump && !card.isBlack))
      )
  }

  def discardCards(playerInt: Int, cardsInfo: ListBuffer[String]): Unit = {
    val player: Player = allPlayers.filter(_.getPlayerNumber == playerInt).asInstanceOf[Player]
    val playersHand: ListBuffer[Card] = player.getPlayersHand.asInstanceOf
    var cards: ListBuffer[Card] = null.asInstanceOf[ListBuffer[Card]]
    for (s <- cardsInfo) {
      val card: Card = playersHand.filter(_.getName == s).asInstanceOf[Card]

      if (!checkIfTrumpOrOp(card)) cards.+=(card)
    }
    player.removeCards(cards.asInstanceOf)
  }
}