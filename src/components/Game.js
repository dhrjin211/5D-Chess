import React, { useEffect, useRef, useState, useCallback } from 'react';
import Chess from '5d-chess-js';
import ChessRenderer from '5d-chess-renderer';
import { useFirebaseGame, watchRoomStatus } from '../hooks/useFirebaseGame';
import './Game.css';

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
    if (!data.actionHistory) return;
    const chess = chessRef.current;
    const remote = data.actionHistory;
    const local = chess.actionHistory;
    if (remote.length > local.length) {
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
    const turn = chess.player === 0 ? 'white' : 'black';
    if (turn === playerColorRef.current) {
      try {
        const moves = chess.moves('all');
        renderer.global.availableMoves(moves);
      } catch (e) {
        renderer.global.availableMoves([]);
      }
    } else {
      renderer.global.availableMoves([]);
    }
  }

  function updateUIState(chess) {
    if (!isMounted.current) return;
    const turn = chess.player === 0 ? 'white' : 'black';
    setCurrentTurn(turn);
    setMoveBuffer(chess.moveBuffer ? [...chess.moveBuffer] : []);
    setInCheck(chess.inCheck ? chess.inCheck.length > 0 : false);
    if (chess.isCheckmate) {
      setGameStatus(chess.player === 0 ? 'Black wins by checkmate!' : 'White wins by checkmate!');
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
    return () => {
      isMounted.current = false;
      unsub();
    };
  }, [roomId]);

  useEffect(() => {
    if (status !== 'playing' || !containerRef.current) return;

    const chess = new Chess();
    chessRef.current = chess;

    const renderer = new ChessRenderer(containerRef.current);
    rendererRef.current = renderer;

    syncRenderer(chess);
    updateUIState(chess);

    // Log ALL events to find correct event name
renderer.on('moveSelect', (move) => {
      console.log('moveSelect fired:', JSON.stringify(move));
      const turn = chess.player === 0 ? 'white' : 'black';
      if (turn !== playerColorRef.current) return;
      try {
        const moves = chess.moves('all');
        const matched = moves.find(m =>
          m.start.timeline === move.start.timeline &&
          m.start.turn === move.start.turn &&
          m.start.player === move.start.player &&
          m.start.coordinate === move.start.coordinate &&
          m.end.timeline === move.end.timeline &&
          m.end.turn === move.end.turn &&
          m.end.player === move.end.player &&
          m.end.coordinate === move.end.coordinate
        );
        console.log('matched move:', JSON.stringify(matched));
        if (matched) {
          chess.move(matched);
          syncRenderer(chess);
          updateUIState(chess);
        }
      } catch (e) {
        console.warn('Invalid move:', e);
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
    if (chess.player !== (playerColorRef.current === 'white' ? 0 : 1)) return;
    if (!chess.moveBuffer || chess.moveBuffer.length === 0) return;
    try {
      chess.submit();
      syncRenderer(chess);
      updateUIState(chess);
      pushMove(chess.actionHistory, null);
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

  const isMyTurn = currentTurn === playerColor;

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
              <div className={`player-indicator ${currentTurn !== playerColor ? 'active' : ''}`} />
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
            <button className="action-btn submit-btn" onClick={handleSubmit} disabled={!isMyTurn || moveBuffer.length === 0}>
              Submit Turn
            </button>
            <button className="action-btn undo-btn" onClick={handleUndo} disabled={!isMyTurn || moveBuffer.length === 0}>
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
