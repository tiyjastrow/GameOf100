package models;

public class Card {
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    String name;
    int suit;
    int rank;
    int ownedByPlayer;
    Integer pointValue;
    Float rankValue;

    public Card(int suit, int rank) {
        this.suit = suit;
        this.rank = rank;
        String s = "";
        String r = "";
        switch (suit) {
            case 1:
                s = "clubs";
            case 2:
                s = "diamonds";
            case 3:
                s = "hearts";
            case 4:
                s = "spades";
        }

        switch (rank) {
            case 1:
                r = "ace";
            case 2:
                r = "two";
            case 3:
                r = "three";
            case 4:
                r = "four";
            case 5:
                r = "five";
            case 6:
                r = "six";
            case 7:
                r = "seven";
            case 8:
                r = "eight";
            case 9:
                r = "nine";
            case 10:
                r = "ten";
            case 11:
                r = "jack";
            case 12:
                r = "queen";
            case 13:
                r = "king";
        }
        this.name = r + "-of-" + s;

        if (suit == 0 && rank == 0) {
            this.name = "joker";
        }
    }

    public Boolean isJoker() { return suit == 0; }
    public Boolean isBlack() { return (suit == 1 || suit == 4); }
    public Boolean isRed() { return (suit == 2 || suit == 3); }

    public Card() {
    }

    public int getSuit() {
        return suit;
    }

    public void setSuit(int suit) {
        this.suit = suit;
    }

    public int getRank() {

        return rank;
    }

    public void setRank(int rank) {
        this.rank = rank;
    }
}