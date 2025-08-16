'use client';

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Square } from 'chess.js';

interface ChessBoardProps {
  onMove: (from: string, to: string, promotion?: string) => void;
  game: Chess;
  isMyTurn: boolean;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ onMove, game, isMyTurn }) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const getPieceSymbol = (piece: any) => {
    const symbols: { [key: string]: string } = {
      'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙',
      'K': '♚', 'Q': '♛', 'R': '♜', 'B': '♝', 'N': '♞', 'P': '♟'
    };
    return symbols[piece.type] || '';
  };

  const getPieceColor = (piece: any) => {
    return piece.color === 'w' ? 'text-white' : 'text-black';
  };

  const handleSquareClick = (square: string) => {
    console.log('Square clicked:', square);
    console.log('Is my turn:', isMyTurn);
    console.log('Game turn:', game.turn());
    console.log('Selected square:', selectedSquare);
    
    if (!isMyTurn) {
      console.log('Not my turn, ignoring click');
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    if (selectedSquare) {
      // Check if this is a valid move
      if (validMoves.includes(square)) {
        // Check if promotion is needed
        const piece = game.get(selectedSquare as Square);
        if (piece?.type === 'p' && (square[1] === '8' || square[1] === '1')) {
          // Pawn promotion - default to queen
          onMove(selectedSquare, square, 'QUEEN');
        } else {
          onMove(selectedSquare, square);
        }
        setSelectedSquare(null);
        setValidMoves([]);
      } else {
        // Select new square
        const piece = game.get(square as Square);
        if (piece && piece.color === game.turn()) {
          setSelectedSquare(square);
          const moves = game.moves({ square: square as Square, verbose: true });
          setValidMoves(moves.map(move => move.to));
        } else {
          // Invalid selection, clear selection
          setSelectedSquare(null);
          setValidMoves([]);
        }
      }
    } else {
      // Select square
      const piece = game.get(square as Square);
      console.log('Piece at square:', piece);
      console.log('Piece color:', piece?.color);
      console.log('Game turn:', game.turn());
      
      if (piece && piece.color === game.turn()) {
        console.log('Selecting piece, getting valid moves');
        setSelectedSquare(square);
        const moves = game.moves({ square: square as Square, verbose: true });
        console.log('Valid moves:', moves);
        setValidMoves(moves.map(move => move.to));
      } else {
        console.log('Cannot select this piece - wrong color or no piece');
      }
    }
  };

  const isSquareSelected = (square: string) => selectedSquare === square;
  const isSquareValidMove = (square: string) => validMoves.includes(square);
  const isSquareLight = (file: string, rank: string) => {
    const fileIndex = files.indexOf(file);
    const rankIndex = ranks.indexOf(rank);
    return (fileIndex + rankIndex) % 2 === 0;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-8 gap-0 border-2 border-gray-800 rounded-lg overflow-hidden shadow-lg">
        {ranks.map((rank) =>
          files.map((file) => {
            const square = `${file}${rank}`;
            const piece = game.get(square as Square);
            const isLight = isSquareLight(file, rank);
            const isSelected = isSquareSelected(square);
            const isValidMove = isSquareValidMove(square);
            
            return (
              <div
                key={square}
                className={`
                  w-16 h-16 md:w-20 md:h-20 flex items-center justify-center cursor-pointer
                  ${isLight ? 'bg-amber-100' : 'bg-amber-800'}
                  ${isSelected ? 'bg-blue-400' : ''}
                  ${isValidMove ? 'bg-green-400' : ''}
                  ${piece ? 'hover:bg-opacity-80' : ''}
                  transition-colors duration-200
                `}
                onClick={() => handleSquareClick(square)}
              >
                {piece && (
                  <span className={`text-3xl md:text-4xl ${getPieceColor(piece)}`}>
                    {getPieceSymbol(piece)}
                  </span>
                )}
                {isValidMove && !piece && (
                  <div className="w-4 h-4 rounded-full bg-green-500 opacity-60"></div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* File labels */}
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        {files.map(file => (
          <span key={file} className="w-16 md:w-20 text-center">{file}</span>
        ))}
      </div>
      
      {/* Rank labels */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-sm text-gray-600 pointer-events-none">
        {ranks.map(rank => (
          <span key={rank} className="h-16 md:h-20 flex items-center justify-center">{rank}</span>
        ))}
      </div>
    </div>
  );
};

export default ChessBoard;
