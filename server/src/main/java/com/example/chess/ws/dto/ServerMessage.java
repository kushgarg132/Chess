package com.example.chess.ws.dto;

public class ServerMessage {
    public String type; // "state" | "info" | "error"
    public String message;

    // For "state"
    public String[][] board; // [rank][file], entries like "wP", "bK", or null
    public String turn;      // "WHITE" | "BLACK"
    public String self;      // "WHITE" | "BLACK" | "SPECTATOR"

    public static ServerMessage state(String[][] board, String turn, String self, String info) {
        ServerMessage m = new ServerMessage();
        m.type = "state";
        m.board = board;
        m.turn = turn;
        m.self = self;
        m.message = info;
        return m;
    }

    public static ServerMessage info(String text) {
        ServerMessage m = new ServerMessage();
        m.type = "info";
        m.message = text;
        return m;
    }

    public static ServerMessage error(String text) {
        ServerMessage m = new ServerMessage();
        m.type = "error";
        m.message = text;
        return m;
    }
}
