'use client';

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { useWebSocket } from '@/hooks/useWebSocket';
import ChessBoard from './ChessBoard';
import { Wifi, WifiOff, Users, Crown, Clock } from 'lucide-react';

interface GameRoomProps {
  roomId: string;
  playerName: string;
  onDisconnect: () => void;
}

const GameRoom: React.FC<GameRoomProps> = ({ roomId, playerName, onDisconnect }) => {
  const [game, setGame] = useState(new Chess('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'));
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  
  const { isConnected, role, turn, messages, boardFen, sendMove, disconnect: wsDisconnect } = useWebSocket(roomId, playerName);

  // Debug role changes
  useEffect(() => {
    console.log('Role changed:', role);
  }, [role]);

  // Debug game changes
  useEffect(() => {
    console.log('Game changed, turn:', game.turn(), 'FEN:', game.fen());
  }, [game]);

  // Debug: Log initial and current board state
  useEffect(() => {
    console.log('Initial boardFen from WebSocket:', boardFen);
    console.log('Initial game FEN:', game.fen());
    console.log('Game state:', {
      turn: game.turn(),
      isGameOver: game.isGameOver(),
      isCheck: game.isCheck(),
      isCheckmate: game.isCheckmate(),
      isDraw: game.isDraw()
    });
  }, []);

  // Sync local game state with server state
  useEffect(() => {
    console.log('Board FEN changed:', boardFen);
    console.log('Current game FEN:', game.fen());
    
    if (boardFen && boardFen !== game.fen()) {
      console.log('Updating board with new FEN:', boardFen);
      try {
        const newGame = new Chess(boardFen);
        setGame(newGame);
        
        // Update game history based on the new board state
        const newHistory = newGame.history();
        setGameHistory(newHistory);
        console.log('Board updated successfully');
        console.log('New game state:', {
          turn: newGame.turn(),
          isGameOver: newGame.isGameOver(),
          isCheck: newGame.isCheck(),
          isCheckmate: newGame.isCheckmate(),
          isDraw: newGame.isDraw()
        });
        

      } catch (error) {
        console.error('Error parsing board FEN:', error);
      }
    } else {
      console.log('No board update needed - FENs are the same or boardFen is empty');
    }
  }, [boardFen, role]); // Add role dependency to recalculate turn



  const handleMove = (from: string, to: string, promotion?: string) => {
    try {
      const moveOptions: any = { from, to };
      if (promotion) {
        moveOptions.promotion = promotion.toLowerCase();
      }

      // Validate the move locally first
      const newGame = new Chess(game.fen());
      const result = newGame.move(moveOptions);
      
      if (result) {
        // Send the move to the server - don't update local state yet
        // The server will send back the updated board state
        sendMove(from, to, promotion);
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
  };

  const resetGame = () => {
    setGame(new Chess());
    setGameHistory([]);
  };

  const handleDisconnect = () => {
    wsDisconnect();
    onDisconnect();
  };

  // Calculate if it's the player's turn based on their role and the current game turn
  const [isMyTurn, setIsMyTurn] = useState(false);
  
  // Update isMyTurn when role or game changes
  useEffect(() => {
    const newIsMyTurn = (role === 'white' && game.turn() === 'w') || (role === 'black' && game.turn() === 'b');
    setIsMyTurn(newIsMyTurn);
    
    // Debug turn calculation
    console.log('Turn debug:', { 
      role, 
      serverTurn: turn, 
      gameTurn: game.turn(), 
      isMyTurn: newIsMyTurn,
      gameFen: game.fen()
    });
  }, [role, game, turn]);

  // Debug isMyTurn changes
  useEffect(() => {
    console.log('isMyTurn changed to:', isMyTurn);
  }, [isMyTurn]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Chess Game</h1>
              <p className="text-gray-600">Room: {roomId}</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
                <span className="text-sm font-medium">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* Player Info */}
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-full">
                <Users size={16} />
                <span className="text-sm font-medium">{playerName}</span>
              </div>

              {/* Role */}
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-800 rounded-full">
                <Crown size={16} />
                <span className="text-sm font-medium capitalize">{role}</span>
              </div>

              {/* Disconnect Button */}
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-full transition-colors"
                title="Leave room"
              >
                <span className="text-sm font-medium">Leave</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Info Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Turn Indicator */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={20} className="text-gray-600" />
                <h3 className="font-semibold text-gray-800">Current Turn</h3>
              </div>
              <div className={`text-lg font-bold capitalize ${
                turn === 'white' ? 'text-gray-800' : 'text-gray-600'
              }`}>
                {turn === 'white' ? '♔ White' : '♚ Black'}
              </div>
              {isMyTurn && (
                <div className="mt-2 text-sm text-green-600 font-medium">
                  It's your turn!
                </div>
              )}
            </div>

            {/* Game Controls */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Game Controls</h3>
              <button
                onClick={resetGame}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors mb-2"
              >
                Reset Game
              </button>
              <button
                onClick={handleDisconnect}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Leave Room
              </button>
            </div>

            {/* Move History */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Move History</h3>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {gameHistory.map((move, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {Math.floor(index / 2) + 1}. {move}
                  </div>
                ))}
                {gameHistory.length === 0 && (
                  <div className="text-sm text-gray-400 italic">No moves yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Chess Board */}
          <div className="lg:col-span-2 flex justify-center">
            <div className="relative">
              <ChessBoard
                onMove={handleMove}
                game={game}
                isMyTurn={isMyTurn}
              />
            </div>
          </div>

          {/* Chat/Messages Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4 h-96">
              <h3 className="font-semibold text-gray-800 mb-3">Game Messages</h3>
              <div className="h-80 overflow-y-auto space-y-2">
                {messages.map((message, index) => (
                  <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                    {message}
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="text-sm text-gray-400 italic">No messages yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;
