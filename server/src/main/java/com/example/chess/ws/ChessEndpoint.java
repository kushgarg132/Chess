package com.example.chess.ws;

import com.example.chess.service.GameRoom;
import com.example.chess.service.GameRoomManager;
import com.example.chess.ws.dto.ClientMessage;
import com.example.chess.util.Json;
import jakarta.websocket.OnClose;
import jakarta.websocket.OnError;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.Session;
import jakarta.websocket.server.ServerEndpoint;
import org.springframework.stereotype.Component;

import java.util.logging.Logger;

@Component
@ServerEndpoint("/ws/chess/{roomId}")
public class ChessEndpoint {
    private static final Logger LOG = Logger.getLogger(ChessEndpoint.class.getName());

    @OnOpen
    public void onOpen(Session session, @PathParam("roomId") String roomId) {
        GameRoom room = GameRoomManager.getInstance().getRoom(roomId);
        room.join(session);
        LOG.info("Session " + session.getId() + " opened room " + roomId);
    }

    @OnMessage
    public void onMessage(Session session, @PathParam("roomId") String roomId, String message) throws Exception {
        GameRoom room = GameRoomManager.getInstance().getRoom(roomId);
        ClientMessage msg = Json.fromJson(message, ClientMessage.class);
        room.handleMessage(session, msg);
    }

    @OnClose
    public void onClose(Session session, @PathParam("roomId") String roomId) {
        GameRoom room = GameRoomManager.getInstance().getRoom(roomId);
        room.leave(session);
        LOG.info("Session " + session.getId() + " closed room " + roomId);
    }

    @OnError
    public void onError(Session session, @PathParam("roomId") String roomId, Throwable thr) {
        LOG.warning("Error in session " + session.getId() + " room " + roomId + ": " + thr.getMessage());
    }
}
