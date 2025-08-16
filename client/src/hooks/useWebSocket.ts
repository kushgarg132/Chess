import { useEffect, useRef, useState, useCallback } from 'react';

export interface ChessMessage {
  type: 'join' | 'move';
  name?: string;
  from?: string;
  to?: string;
  promotion?: 'QUEEN' | 'ROOK' | 'BISHOP' | 'KNIGHT';
}

export interface ChessGameState {
  isConnected: boolean;
  role: string;
  turn: string;
  messages: string[];
  boardFen: string;
}

export const useWebSocket = (roomId: string, playerName: string) => {
  const [gameState, setGameState] = useState<ChessGameState>({
    isConnected: false,
    role: '-',
    turn: 'white',
    messages: [],
    boardFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>();
  const isConnectingRef = useRef(false);
  const currentRoomIdRef = useRef<string>('');
  const currentPlayerNameRef = useRef<string>('');

  const connect = useCallback(() => {
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // If we're already connected to the same room, don't reconnect
    if (currentRoomIdRef.current === roomId && 
        currentPlayerNameRef.current === playerName && 
        wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // Clean up any existing connection first
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (!roomId || !playerName) return;

    isConnectingRef.current = true;
    currentRoomIdRef.current = roomId;
    currentPlayerNameRef.current = playerName;

    const wsUrl = `ws://localhost:8080/ws/chess/${roomId}`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('Connected to chess server');
      isConnectingRef.current = false;
      setGameState(prev => ({ ...prev, isConnected: true }));
      
      // Send join message
      const joinMessage: ChessMessage = {
        type: 'join',
        name: playerName
      };
      ws.send(JSON.stringify(joinMessage));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);
        
        // Handle different message types from server
        if (data.type === 'gameState') {
          console.log('Received gameState message:', data);
          console.log('Turn data from server:', data.turn);
          console.log('Role data from server:', data.role);
          setGameState(prev => {
            const newState = {
              ...prev,
              role: data.role || prev.role,
              turn: data.turn || prev.turn,
              boardFen: data.boardFen || prev.boardFen
            };
            console.log('Updated gameState:', newState);
            return newState;
          });
        } else if (data.type === 'move') {
          // Handle move updates from server
          console.log('Received move message:', data);
          setGameState(prev => {
            const newState = {
              ...prev,
              boardFen: data.boardFen || prev.boardFen,
              turn: data.turn || prev.turn
            };
            console.log('Updated gameState after move:', newState);
            return newState;
          });
        } else if (data.type === 'message') {
          console.log('Received message:', data);
          setGameState(prev => ({
            ...prev,
            messages: [...prev.messages, data.content]
          }));
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from chess server');
      isConnectingRef.current = false;
      setGameState(prev => ({ ...prev, isConnected: false }));
      
      // Only attempt to reconnect if we're still in the same room
      if (currentRoomIdRef.current === roomId && currentPlayerNameRef.current === playerName) {
        reconnectTimeoutRef.current = setTimeout(() => {
          if (currentRoomIdRef.current === roomId && currentPlayerNameRef.current === playerName) {
            connect();
          }
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      isConnectingRef.current = false;
    };

    wsRef.current = ws;
  }, [roomId, playerName]);

  const disconnect = useCallback(() => {
    // Clear reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }
    
    // Reset connection state
    isConnectingRef.current = false;
    currentRoomIdRef.current = '';
    currentPlayerNameRef.current = '';
    
    // Close WebSocket connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Reset game state
    setGameState({
      isConnected: false,
      role: '-',
      turn: 'white',
      messages: [],
      boardFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    });
  }, []);

  const sendMove = useCallback((from: string, to: string, promotion?: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const moveMessage: ChessMessage = {
        type: 'move',
        from,
        to,
        promotion: promotion as any
      };
      wsRef.current.send(JSON.stringify(moveMessage));
    }
  }, []);

  useEffect(() => {
    // Only connect if we have both roomId and playerName
    if (roomId && playerName) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [roomId, playerName, connect, disconnect]);

  return {
    ...gameState,
    sendMove,
    connect,
    disconnect
  };
};
