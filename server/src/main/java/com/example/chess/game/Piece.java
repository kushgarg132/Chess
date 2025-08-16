package com.example.chess.game;

import java.util.Objects;

public final class Piece {
    private final Color color;
    private final Type type;
    private final boolean hasMoved;

    public Piece(Color color, Type type) {
        this(color, type, false);
    }

    public Piece(Color color, Type type, boolean hasMoved) {
        this.color = Objects.requireNonNull(color);
        this.type = Objects.requireNonNull(type);
        this.hasMoved = hasMoved;
    }

    public Color getColor() {
        return color;
    }

    public Type getType() {
        return type;
    }

    public boolean hasMoved() {
        return hasMoved;
    }

    public Piece markMoved() {
        return hasMoved ? this : new Piece(color, type, true);
    }

    @Override
    public String toString() {
        char c = color == Color.WHITE ? 'w' : 'b';
        char t = switch (type) {
            case KING -> 'K';
            case QUEEN -> 'Q';
            case ROOK -> 'R';
            case BISHOP -> 'B';
            case KNIGHT -> 'N';
            case PAWN -> 'P';
        };
        return "" + c + t;
    }

    public static Piece fromString(String s) {
        if (s == null || s.length() != 2) return null;
        Color c = s.charAt(0) == 'w' ? Color.WHITE : Color.BLACK;
        Type t = switch (s.charAt(1)) {
            case 'K' -> Type.KING;
            case 'Q' -> Type.QUEEN;
            case 'R' -> Type.ROOK;
            case 'B' -> Type.BISHOP;
            case 'N' -> Type.KNIGHT;
            case 'P' -> Type.PAWN;
            default -> throw new IllegalArgumentException("Unknown piece: " + s);
        };
        return new Piece(c, t);
    }
}
