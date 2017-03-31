import java.util

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

  var cat: ListBuffer[Card] = _
  var currentBidder: Player = _
  var winningBidder: Player = _
  var winningBid: Int = 61

  var leader: Player = _
  var trump: Int = _
  var currentRound: Int = 1


  val allPlayers: ListBuffer[Player] = _
  allPlayers.+=(player1, player2, player3, player4)

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
    deck.deal(5).forEach(card => cat += card)
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
    targetPlayer.addCards(convertListBufferToArrayList(cards))
    passingPlayer.removeCards(convertListBufferToArrayList(cards))
  }

  def checkIfTrumpOrOp(card: Card): Boolean = {
    var isTrumpOrOp: Boolean = null.asInstanceOf[Boolean]
    if (card.rank == 0 || card.rank == 5 || card.rank == 9 || card.rank == 11 || card.rank == 13) {
      if (trump == 1 || trump == 4) {
        isTrumpOrOp = card.suit == 1 || card.suit == 4
      }
      if (trump == 2 || trump == 3) {
        isTrumpOrOp = card.suit == 2 || card.suit == 3
      }
    }
    isTrumpOrOp
  }

  def discardCards(playerInt: Int, cardsInfo: ListBuffer[String]): Unit = {
    val player: Player = allPlayers.filter(_.playerNumber == playerInt).asInstanceOf[Player]
    val playersHand: ListBuffer[Card] = convertArrayListToListBuffer(player.playersHand)
    var cards: ListBuffer[Card] = null.asInstanceOf[ListBuffer[Card]]
    for (s <- cardsInfo) {
      val card: Card = playersHand.filter(_.name == s).asInstanceOf[Card]

      if(!checkIfTrumpOrOp(card)) cards.+=(card)
    }
    player.removeCards(convertListBufferToArrayList(cards))
  }

  def convertListBufferToArrayList(lb: ListBuffer[Card]): util.ArrayList[Card] = {
    var tempList = new util.ArrayList[Card]
    for (c <- lb) {
      tempList.add(c)
    }
    tempList
  }

  def convertArrayListToListBuffer(al: util.ArrayList[Card]): ListBuffer[Card] = {
    var tempList: ListBuffer[Card] = null.asInstanceOf[ListBuffer[Card]]
    for (c <- al) {
      tempList.+=(c)
    }
    tempList
  }
}