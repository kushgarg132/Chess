package com.example.chess.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class GameRoomManager {
    private static final GameRoomManager INSTANCE = new GameRoomManager();
    private final Map<String, GameRoom> rooms = new ConcurrentHashMap<>();

    public static GameRoomManager getInstance() {
        return INSTANCE;
    }

    public GameRoom getRoom(String id) {
        return rooms.computeIfAbsent(id, GameRoom::new);
    }
}
