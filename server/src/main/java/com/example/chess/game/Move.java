package com.example.chess.game;

import java.util.Objects;

public final class Move {
    private final Position from;
    private final Position to;
    private final Type promotion; // optional

    public Move(Position from, Position to) {
        this(from, to, null);
    }

    public Move(Position from, Position to, Type promotion) {
        this.from = Objects.requireNonNull(from);
        this.to = Objects.requireNonNull(to);
        this.promotion = promotion;
    }

    public Position from() { return from; }
    public Position to() { return to; }
    public Type promotion() { return promotion; }

    @Override
    public String toString() {
        return from + "-" + to + (promotion != null ? "=" + promotion : "");
    }
}
