package com.example.chess.ws.dto;

public class ClientMessage {
    public String type; // "join" | "move"
    // join
    public String name;
    // move
    public String from; // algebraic e.g., "e2"
    public String to;   // algebraic e.g., "e4"
    public String promotion; // "QUEEN","ROOK","BISHOP","KNIGHT" (optional)
}
