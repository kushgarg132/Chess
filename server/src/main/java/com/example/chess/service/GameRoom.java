package com.example.chess.service;

import com.example.chess.game.Board;
import com.example.chess.game.Color;
import com.example.chess.game.Move;
import com.example.chess.game.Position;
import com.example.chess.game.Type;
import com.example.chess.ws.dto.ClientMessage;
import com.example.chess.ws.dto.ServerMessage;
import com.example.chess.util.Json;
import jakarta.websocket.Session;

import java.io.IOException;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

public class GameRoom {
    private final String id;
    private final Board board = Board.initial();
    private final Map<Session, Color> playerColors = new ConcurrentHashMap<>();
    private final Map<Session, String> names = new ConcurrentHashMap<>();

    public GameRoom(String id) {
        this.id = Objects.requireNonNull(id);
    }

    public String id() {
        return id;
    }

    public synchronized void join(Session session) {
        if (!playerColors.containsKey(session)) {
            if (!playerColors.containsValue(Color.WHITE)) {
                playerColors.put(session, Color.WHITE);
            } else if (!playerColors.containsValue(Color.BLACK)) {
                playerColors.put(session, Color.BLACK);
            } else {
                playerColors.put(session, null); // spectator
            }
        }
        sendStateTo(session, "Welcome to room " + id + ".");
        broadcastInfo(displayName(session) + " joined.");
    }

    public synchronized void leave(Session session) {
        Color c = playerColors.remove(session);
        String name = names.remove(session);
        broadcastInfo((name != null ? name : "A player") + " left.");
    }

    public synchronized void setName(Session session, String name) {
        names.put(session, name);
        broadcastInfo(displayName(session) + " is here.");
    }

    private String displayName(Session s) {
        String n = names.get(s);
        Color c = playerColors.get(s);
        String role = c == null ? "Spectator" : c.name();
        return (n == null || n.isBlank() ? "Player" : n) + " (" + role + ")";
    }

    public synchronized void handleMessage(Session session, ClientMessage msg) {
        if (msg == null || msg.type == null) return;
        switch (msg.type) {
            case "join" -> {
                if (msg.name != null) setName(session, msg.name);
                sendStateTo(session, "Joined room " + id + ".");
            }
            case "move" -> {
                if (msg.from == null || msg.to == null) {
                    sendError(session, "Invalid move message");
                    return;
                }
                Color player = playerColors.get(session);
                if (player == null) {
                    sendError(session, "Spectators cannot move.");
                    return;
                }
                if (board.getTurn() != player) {
                    sendError(session, "Not your turn.");
                    return;
                }
                Position from = Position.fromAlgebraic(msg.from);
                Position to = Position.fromAlgebraic(msg.to);
                Type promo = null;
                if (msg.promotion != null) {
                    try {
                        promo = Type.valueOf(msg.promotion.toUpperCase());
                    } catch (IllegalArgumentException ignored) {
                        // default to queen in board
                    }
                }
                boolean ok = board.applyMoveIfLegal(new Move(from, to, promo));
                if (!ok) {
                    sendError(session, "Illegal move.");
                    return;
                }
                broadcastState(displayName(session) + " played " + msg.from + "-" + msg.to + ".");
            }
            default -> sendError(session, "Unknown message type: " + msg.type);
        }
    }

    private void send(Session s, ServerMessage m) {
        try {
            s.getBasicRemote().sendText(Json.toJson(m));
        } catch (IOException e) {
            // Ignore broken sessions
        }
    }

    private void sendError(Session s, String text) {
        send(s, ServerMessage.error(text));
    }

    private void sendStateTo(Session s, String info) {
        String self = Optional.ofNullable(playerColors.get(s)).map(Enum::name).orElse("SPECTATOR");
        send(s, ServerMessage.state(board.toStringBoard(), board.getTurn().name(), self, info));
    }

    private void broadcastInfo(String info) {
        for (Session s : playerColors.keySet()) {
            send(s, ServerMessage.info(info));
        }
    }

    private void broadcastState(String info) {
        for (Session s : playerColors.keySet()) {
            String self = Optional.ofNullable(playerColors.get(s)).map(Enum::name).orElse("SPECTATOR");
            send(s, ServerMessage.state(board.toStringBoard(), board.getTurn().name(), self, info));
        }
    }
}
