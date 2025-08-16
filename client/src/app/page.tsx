'use client';

import { useState, useEffect } from 'react';
import ConnectionForm from '@/components/ConnectionForm';
import GameRoom from '@/components/GameRoom';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleConnect = (name: string, room: string) => {
    setPlayerName(name);
    setRoomId(room);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setPlayerName('');
    setRoomId('');
  };

  // Cleanup effect to ensure proper disconnection
  useEffect(() => {
    return () => {
      // This will run when the component unmounts
      if (isConnected) {
        setIsConnected(false);
      }
    };
  }, [isConnected]);

  if (isConnected) {
    return (
      <GameRoom
        roomId={roomId}
        playerName={playerName}
        onDisconnect={handleDisconnect}
      />
    );
  }

  return <ConnectionForm onConnect={handleConnect} />;
}
