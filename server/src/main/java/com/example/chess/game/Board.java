package com.example.chess.game;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class Board {
    private final Piece[][] grid = new Piece[8][8]; // [rank][file]
    private Color turn = Color.WHITE;

    public Board() {
        setupInitial();
    }

    public static Board initial() {
        return new Board();
    }

    public Color getTurn() {
        return turn;
    }

    public Piece get(int file, int rank) {
        return grid[rank][file];
    }

    public Piece get(Position p) {
        return get(p.file(), p.rank());
    }

    public void set(int file, int rank, Piece piece) {
        grid[rank][file] = piece;
    }

    public void set(Position p, Piece piece) {
        set(p.file(), p.rank(), piece);
    }

    public String[][] toStringBoard() {
        String[][] out = new String[8][8];
        for (int r = 0; r < 8; r++) {
            for (int f = 0; f < 8; f++) {
                out[r][f] = grid[r][f] == null ? null : grid[r][f].toString();
            }
        }
        return out;
    }

    private void setupInitial() {
        // Clear
        for (int r = 0; r < 8; r++) for (int f = 0; f < 8; f++) grid[r][f] = null;
        // Pawns
        for (int f = 0; f < 8; f++) {
            grid[1][f] = new Piece(Color.WHITE, Type.PAWN);
            grid[6][f] = new Piece(Color.BLACK, Type.PAWN);
        }
        // Rooks
        grid[0][0] = new Piece(Color.WHITE, Type.ROOK);
        grid[0][7] = new Piece(Color.WHITE, Type.ROOK);
        grid[7][0] = new Piece(Color.BLACK, Type.ROOK);
        grid[7][7] = new Piece(Color.BLACK, Type.ROOK);
        // Knights
        grid[0][1] = new Piece(Color.WHITE, Type.KNIGHT);
        grid[0][6] = new Piece(Color.WHITE, Type.KNIGHT);
        grid[7][1] = new Piece(Color.BLACK, Type.KNIGHT);
        grid[7][6] = new Piece(Color.BLACK, Type.KNIGHT);
        // Bishops
        grid[0][2] = new Piece(Color.WHITE, Type.BISHOP);
        grid[0][5] = new Piece(Color.WHITE, Type.BISHOP);
        grid[7][2] = new Piece(Color.BLACK, Type.BISHOP);
        grid[7][5] = new Piece(Color.BLACK, Type.BISHOP);
        // Queens
        grid[0][3] = new Piece(Color.WHITE, Type.QUEEN);
        grid[7][3] = new Piece(Color.BLACK, Type.QUEEN);
        // Kings
        grid[0][4] = new Piece(Color.WHITE, Type.KING);
        grid[7][4] = new Piece(Color.BLACK, Type.KING);

        turn = Color.WHITE;
    }

    private boolean inBounds(int f, int r) {
        return f >= 0 && f < 8 && r >= 0 && r < 8;
    }

    public boolean applyMoveIfLegal(Move move) {
        Objects.requireNonNull(move);
        Piece piece = get(move.from());
        if (piece == null) return false;
        if (piece.getColor() != turn) return false;

        if (!isPseudoLegal(move, piece)) return false;

        // simulate
        Piece captured = get(move.to());
        Piece movedOriginal = piece;
        Piece moved = piece.markMoved();
        set(move.to(), moved);
        set(move.from(), null);

        boolean illegal = isKingInCheck(turn);
        if (illegal) {
            // revert
            set(move.from(), movedOriginal);
            set(move.to(), captured);
            return false;
        }

        // handle promotion (simple: if promotion provided and target rank appropriate)
        if (moved.getType() == Type.PAWN) {
            int promotionRank = (moved.getColor() == Color.WHITE) ? 7 : 0;
            if (move.to().rank() == promotionRank) {
                Type promo = move.promotion() != null ? move.promotion() : Type.QUEEN;
                set(move.to(), new Piece(moved.getColor(), promo, true));
            }
        }

        // Switch turn
        turn = turn.opposite();
        return true;
    }

    private boolean isPseudoLegal(Move move, Piece piece) {
        Position from = move.from();
        Position to = move.to();
        if (from.equals(to)) return false;
        Piece dest = get(to);
        if (dest != null && dest.getColor() == piece.getColor()) return false;

        int df = to.file() - from.file();
        int dr = to.rank() - from.rank();
        int af = Math.abs(df);
        int ar = Math.abs(dr);

        switch (piece.getType()) {
            case PAWN -> {
                int dir = piece.getColor() == Color.WHITE ? 1 : -1;
                int startRank = piece.getColor() == Color.WHITE ? 1 : 6;
                // forward move
                if (df == 0) {
                    if (dr == dir && get(to) == null) return true;
                    if (from.rank() == startRank && dr == 2 * dir) {
                        int midRank = from.rank() + dir;
                        if (get(from.file(), midRank) == null && get(to) == null) return true;
                    }
                }
                // capture
                if (ar == 1 && dr == dir) {
                    if (dest != null && dest.getColor() != piece.getColor()) return true;
                }
                return false;
            }
            case KNIGHT -> {
                return (af == 1 && ar == 2) || (af == 2 && ar == 1);
            }
            case BISHOP -> {
                if (af != ar) return false;
                return pathClear(from, to, Integer.signum(df), Integer.signum(dr));
            }
            case ROOK -> {
                if (!(df == 0 || dr == 0)) return false;
                return pathClear(from, to, Integer.signum(df), Integer.signum(dr));
            }
            case QUEEN -> {
                if (af == ar || df == 0 || dr == 0) {
                    return pathClear(from, to, Integer.signum(df), Integer.signum(dr));
                }
                return false;
            }
            case KING -> {
                return af <= 1 && ar <= 1;
            }
            default -> {
                return false;
            }
        }
    }

    private boolean pathClear(Position from, Position to, int stepF, int stepR) {
        int f = from.file() + stepF;
        int r = from.rank() + stepR;
        while (f != to.file() || r != to.rank()) {
            if (!inBounds(f, r)) return false;
            if (get(f, r) != null) return false;
            f += stepF;
            r += stepR;
        }
        return true;
    }

    public boolean isKingInCheck(Color color) {
        Position kingPos = findKing(color);
        if (kingPos == null) return false; // should not happen
        return isSquareAttacked(kingPos, color.opposite());
    }

    private Position findKing(Color color) {
        for (int r = 0; r < 8; r++) {
            for (int f = 0; f < 8; f++) {
                Piece p = grid[r][f];
                if (p != null && p.getType() == Type.KING && p.getColor() == color) {
                    return new Position(f, r);
                }
            }
        }
        return null;
    }

    private boolean isSquareAttacked(Position pos, Color byColor) {
        int f = pos.file();
        int r = pos.rank();

        // Pawn attacks
        int pawnDir = byColor == Color.WHITE ? 1 : -1;
        int pr1f = f - 1, pr1r = r - pawnDir; // a pawn that moved from this square would attack 'pos'
        int pr2f = f + 1, pr2r = r - pawnDir;
        if (inBounds(pr1f, pr1r)) {
            Piece p = get(pr1f, pr1r);
            if (p != null && p.getColor() == byColor && p.getType() == Type.PAWN) return true;
        }
        if (inBounds(pr2f, pr2r)) {
            Piece p = get(pr2f, pr2r);
            if (p != null && p.getColor() == byColor && p.getType() == Type.PAWN) return true;
        }

        // Knight attacks
        int[][] kOffsets = {{1,2},{2,1},{-1,2},{-2,1},{1,-2},{2,-1},{-1,-2},{-2,-1}};
        for (int[] o : kOffsets) {
            int nf = f + o[0], nr = r + o[1];
            if (inBounds(nf, nr)) {
                Piece p = get(nf, nr);
                if (p != null && p.getColor() == byColor && p.getType() == Type.KNIGHT) return true;
            }
        }

        // Bishop/Queen diagonals
        int[][] diagDirs = {{1,1},{1,-1},{-1,1},{-1,-1}};
        for (int[] d : diagDirs) {
            int nf = f + d[0], nr = r + d[1];
            while (inBounds(nf, nr)) {
                Piece p = get(nf, nr);
                if (p != null) {
                    if (p.getColor() == byColor && (p.getType() == Type.BISHOP || p.getType() == Type.QUEEN)) {
                        return true;
                    } else {
                        break;
                    }
                }
                nf += d[0]; nr += d[1];
            }
        }

        // Rook/Queen straights
        int[][] lineDirs = {{1,0},{-1,0},{0,1},{0,-1}};
        for (int[] d : lineDirs) {
            int nf = f + d[0], nr = r + d[1];
            while (inBounds(nf, nr)) {
                Piece p = get(nf, nr);
                if (p != null) {
                    if (p.getColor() == byColor && (p.getType() == Type.ROOK || p.getType() == Type.QUEEN)) {
                        return true;
                    } else {
                        break;
                    }
                }
                nf += d[0]; nr += d[1];
            }
        }

        // King adjacency
        for (int df = -1; df <= 1; df++) {
            for (int dr = -1; dr <= 1; dr++) {
                if (df == 0 && dr == 0) continue;
                int nf = f + df, nr = r + dr;
                if (inBounds(nf, nr)) {
                    Piece p = get(nf, nr);
                    if (p != null && p.getColor() == byColor && p.getType() == Type.KING) return true;
                }
            }
        }

        return false;
    }
}
