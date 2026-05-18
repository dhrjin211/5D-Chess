import React, { useEffect, useRef, useState, useCallback } from 'react';
import Chess from '5d-chess-js';
import ChessRenderer from '5d-chess-renderer';
import { useFirebaseGame, watchRoomStatus } from '../hooks/useFirebaseGame';
import './Game.css';

function serializeHistory(actionHistory) {
  try {
    return actionHistory.map(action => ({
      start: {
        timeline: action.start.timeline,
        turn: action.start.turn,
        player: action.start.player,
        coordinate: action.start.coordinate,
      },
      end: {
        timeline: action.end.timeline,
        turn: action.end.turn,
        player: action.end.player,
        coordinate: action.end.coordinate,
      },
    }));
  } catch(e) { return []; }
}

export default function Game({ roomId, playerColor, isHost, onLeave }) {
  const containerRef = useRef(null);
  const chessRef = useRef(null);
  const rendererRef = useRef(null);
  const playerColorRef = useRef(playerColor);
  const [status, setStatus] = useState('waiting');
  const [gameStatus, setGameStatus] = useState('');
  const [currentTurn, setCurrentTurn] = useState('white');
  const [moveBuffer, setMoveBuffer] = useState([]);
  const [inCheck, setInCheck] = useState(false);
  const isMounted = useRef(true);

  const handleGameUpdate = useCallback((data) => {
    if (!chessRef.current || !rendererRef.current) return;
    if (!data.actionHistory || !Array.isArray(data.actionHistory)) return;
    const chess = chessRef.current;
    const remote = data.actionHistory;
    if (remote.length > chess.actionHistory.length) {
      try {
        chess.reset();
        for (const action of remote) {
          chess.action(action, true);
        }
        syncRenderer(chess);
        updateUIState(chess);
      } catch (e) {
        console.warn('Failed to sync remote state:', e);
      }
    }
  }, []);

  const { pushMove } = useFirebaseGame(roomId, playerColor, handleGameUpdate);

  function syncRenderer(chess) {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.global.sync(chess);
    // Show available moves only when it's this player's turn
    // In 5d-chess-js: player 0 = white, player 1 = black
    const myPlayerIndex = playerColorRef.current === 'white' ? 0 : 1;
    const itIsMyTurn = chess.player === myPlayerIndex;
    if (itIsMyTurn) {
      try {
        renderer.global.availableMoves(chess.moves('all'));
      } catch (e) {
        renderer.global.availableMoves([]);
      }
    } else {
      renderer.global.availableMoves([]);
    }
  }

  function updateUIState(chess) {
    if (!isMounted.current) return;
    // chess.player is who moves NEXT (0=white, 1=black)
    const turn = chess.player === 0 ? 'white' : 'black';
    setCurrentTurn(turn);
    setMoveBuffer(chess.moveBuffer ? [...chess.moveBuffer] : []);
    setInCheck(!!(chess.inCheck && chess.inCheck.length > 0));
    if (chess.isCheckmate) {
      setGameStatus(chess.player === 0 ? 'Black wins!' : 'White wins!');
    } else if (chess.isStalemate) {
      setGameStatus('Draw by stalemate');
    } else if (chess.inCheck && chess.inCheck.length > 0) {
      setGameStatus('Check!');
    } else {
      setGameStatus('');
    }
  }

  useEffect(() => {
    isMounted.current = true;
    const unsub = watchRoomStatus(roomId, (s) => {
      if (isMounted.current) setStatus(s || 'waiting');
    });
    return () => { isMounted.current = false; unsub(); };
  }, [roomId]);

  useEffect(() => {
    if (status !== 'playing' || !containerRef.current) return;

    const chess = new Chess();
    chessRef.current = chess;

    const renderer = new ChessRenderer(containerRef.current);
    rendererRef.current = renderer;

    syncRenderer(chess);
    updateUIState(chess);

    renderer.on('moveSelect', (move) => {
      const chess = chessRef.current;
      if (!chess) return;
      // Only allow moving if it's your turn
      const myPlayerIndex = playerColorRef.current === 'white' ? 0 : 1;
      if (chess.player !== myPlayerIndex) return;
      try {
        chess.move(move);
        syncRenderer(chess);
        updateUIState(chess);
      } catch (e) {
        console.warn('Move failed:', e);
      }
    });

    return () => {
      renderer.destroy();
      rendererRef.current = null;
      chessRef.current = null;
    };
  }, [status]);

  function handleSubmit() {
    const chess = chessRef.current;
    if (!chess) return;
    if (!chess.moveBuffer || chess.moveBuffer.length === 0) return;
    try {
      // submit() finalizes the current player's turn
      chess.submit();
      syncRenderer(chess);
      updateUIState(chess);
      pushMove(serializeHistory(chess.actionHistory));
    } catch (e) {
      console.warn('Submit failed:', e);
    }
  }

  function handleUndo() {
    const chess = chessRef.current;
    if (!chess) return;
    try {
      chess.undo();
      syncRenderer(chess);
      updateUIState(chess);
    } catch (e) {
      console.warn('Undo failed:', e);
    }
  }

  // isMyTurn: it's your turn when chess.player matches your color index
  // BUT also show "your turn" when you have moves staged (moveBuffer > 0 and you just moved)
  const myPlayerIndex = playerColor === 'white' ? 0 : 1;
  const chess = chessRef.current;
  const hasStagedMoves = moveBuffer.length > 0;
  // After staging moves, chess.player flips - so check moveBuffer too
  const isMyTurn = currentTurn === playerColor || hasStagedMoves;

  return (
    <div className="game">
      <div className="game-header">
        <div className="game-header-left">
          <span className="game-logo">5D CHESS</span>
          <span className="game-room-code">Room: {roomId}</span>
        </div>
        <div className="game-header-center">
          {gameStatus && (
            <span className={`game-status-badge ${inCheck ? 'check' : ''}`}>
              {gameStatus}
            </span>
          )}
        </div>
        <div className="game-header-right">
          <button className="btn-leave" onClick={onLeave}>Leave</button>
        </div>
      </div>

      {status === 'waiting' && (
        <div className="waiting-overlay">
          <div className="waiting-card">
            <div className="waiting-spinner" />
            <h2>Waiting for opponent</h2>
            <p>Share this code with your friend:</p>
            <div className="waiting-code">{roomId}</div>
            <p className="waiting-sub">You are playing as <strong>{playerColor}</strong></p>
          </div>
        </div>
      )}

      <div className="game-body">
        <div className="board-container" ref={containerRef} />
        <div className="side-panel">
          <div className="side-section">
            <div className="player-block opponent">
              <div className={`player-indicator ${!isMyTurn ? 'active' : ''}`} />
              <div>
                <div className="player-name">Opponent</div>
                <div className="player-color">{playerColor === 'white' ? 'Black' : 'White'}</div>
              </div>
            </div>
          </div>
          <div className="side-divider" />
          <div className="side-section turn-section">
            <div className={`turn-indicator ${isMyTurn ? 'your-turn' : 'waiting-turn'}`}>
              {isMyTurn ? '◆ Your Turn' : '◇ Waiting...'}
            </div>
            {moveBuffer.length > 0 && (
              <div className="move-buffer-info">
                {moveBuffer.length} move{moveBuffer.length > 1 ? 's' : ''} staged
              </div>
            )}
          </div>
          <div className="side-divider" />
          <div className="side-section actions-section">
            <button
              className="action-btn submit-btn"
              onClick={handleSubmit}
              disabled={moveBuffer.length === 0}
            >
              Submit Turn
            </button>
            <button
              className="action-btn undo-btn"
              onClick={handleUndo}
              disabled={moveBuffer.length === 0}
            >
              Undo Move
            </button>
          </div>
          <div className="side-divider" />
          <div className="side-section help-section">
            <div className="help-title">How to play</div>
            <ul className="help-list">
              <li>Click a piece to see valid moves</li>
              <li>Click a highlighted square to move</li>
              <li>Move across timelines by clicking squares on other boards</li>
              <li>Press <strong>Submit Turn</strong> when done</li>
              <li>Pinch/scroll to zoom, drag to pan</li>
            </ul>
          </div>
          <div className="side-divider" />
          <div className="side-section">
            <div className="player-block you">
              <div className={`player-indicator ${isMyTurn ? 'active' : ''}`} />
              <div>
                <div className="player-name">You</div>
                <div className="player-color">{playerColor.charAt(0).toUpperCase() + playerColor.slice(1)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
