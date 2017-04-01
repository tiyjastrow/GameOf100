package models;

import java.util.ArrayList;
import java.util.List;

import models.Card;

public class Player {

    public ArrayList<Card> getPlayersHand() {
        return playersHand;
    }

    public void setPlayersHand(ArrayList<Card> playersHand) {
        this.playersHand = playersHand;
    }

    ArrayList<Card> playersHand = new ArrayList<>();
    int playerNumber;
    String playerName;
    int bid;
    Player teammate;

    public Player() {
    }

    public int getPlayerNumber() {
        return playerNumber;
    }

    public void setPlayerNumber(int playerNumber) {
        this.playerNumber = playerNumber;
    }

    public Player(int playerNumber) {
        this.playerNumber = playerNumber;
    }

    public ArrayList<Card> getHand() {
        return playersHand;
    }

    public void setHand(ArrayList<Card> playersHand) {
        this.playersHand = playersHand;
    }

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public int getBid() {
        return bid;
    }

    public void setBid(int bid) {
        this.bid = bid;
    }

    public Player getTeammate() {
        return teammate;
    }

    public void setTeammate(Player teammate) {
        this.teammate = teammate;
    }

    public void addCatToHand(ArrayList<Card> cat) {
        playersHand.addAll(cat);
    }

    public void takeCards(ArrayList<Card> passedCards) {
        playersHand.addAll(passedCards);
    }

    public void addCard( Card card) {
        playersHand.add(card);
    }

    public void addCards(ArrayList<Card> cards){
        playersHand.addAll(cards);
    }

    public void removeCards(List<Card> cards){
        playersHand.removeAll(cards);
    }

    public void removeCard(Card card) {playersHand.remove(card);}

    //method to handle when players discard from original hand of 12 down to 6 card-->activeHand
    //cards discarded are simply deleted (go to garbage pile)
    public void discardCard(Card card) {
        playersHand.remove(card);
    }

    //method to handle when a player lays down a card to play during active round of play-->card returned will go into the Trick
    //class
    public Card playCard(Player player, Card card) {
        playersHand.remove(card);
        return card;
    }
}