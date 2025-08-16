package com.example.chess.game;

import java.util.Objects;

public final class Position {
    private final int file; // 0..7 for a..h
    private final int rank; // 0..7 for 1..8

    public Position(int file, int rank) {
        if (file < 0 || file > 7 || rank < 0 || rank > 7) {
            throw new IllegalArgumentException("Out of bounds: file=" + file + " rank=" + rank);
        }
        this.file = file;
        this.rank = rank;
    }

    public int file() { return file; }
    public int rank() { return rank; }

    public static Position fromAlgebraic(String s) {
        if (s == null || s.length() != 2) {
            throw new IllegalArgumentException("Invalid square: " + s);
        }
        int f = s.charAt(0) - 'a';
        int r = s.charAt(1) - '1';
        return new Position(f, r);
    }

    public String toAlgebraic() {
        return "" + (char)('a' + file) + (char)('1' + rank);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Position p)) return false;
        return file == p.file && rank == p.rank;
    }

    @Override
    public int hashCode() {
        return Objects.hash(file, rank);
    }

    @Override
    public String toString() {
        return toAlgebraic();
    }
}
