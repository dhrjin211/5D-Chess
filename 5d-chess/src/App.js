import React, { useState } from 'react';
import Lobby from './components/Lobby';
import Game from './components/Game';

export default function App() {
  const [session, setSession] = useState(null);
  // session = { roomId, playerColor, isHost }

  function handleJoin(roomId, playerColor, isHost) {
    setSession({ roomId, playerColor, isHost });
  }

  function handleLeave() {
    setSession(null);
  }

  if (session) {
    return (
      <Game
        roomId={session.roomId}
        playerColor={session.playerColor}
        isHost={session.isHost}
        onLeave={handleLeave}
      />
    );
  }

  return <Lobby onJoin={handleJoin} />;
}
