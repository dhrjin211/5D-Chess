import React, { useEffect, useRef, useState, useCallback } from 'react';
import Chess from '5d-chess-js';
import ChessRenderer from '5d-chess-renderer';
import { useFirebaseGame, watchRoomStatus } from '../hooks/useFirebaseGame';
import './Game.css';

export default function Game({ roomId, playerColor, isHost, onLeave }) {
  const containerRef = useRef(null);
  const chessRef = useRef(null);
  const rendererRef = useRef(null);
  const [status, setStatus] = useState('waiting');
  const [gameStatus, setGameStatus] = useState('');
  const [currentTurn, setCurrentTurn] = useState('white');
  const [moveBuffer, setMoveBuffer] = useState([]);
  const [inCheck, setInCheck] = useState(false);
  const isMounted = useRef(true);

  // Handle incoming Firebase updates
  const handleGameUpdate = useCallback((data) => {
    if (!chessRef.current || !rendererRef.current) return;
    if (!data.actionHistory) return;

    const chess = chessRef.current;
    const remote = data.actionHistory;
    const local = chess.actionHistory;

    // Only apply if remote has more moves than local
    if (remote.length > local.length) {
      try {
        // Reset and replay all actions
        chess.reset();
        for (const action of remote) {
          chess.action(action, true);
        }
        rendererRef.current.global.sync(chess);
        updateUIState(chess);
      } catch (e) {
        console.warn('Failed to sync remote state:', e);
      }
    }
  }, []);

  const { pushMove } = useFirebaseGame(roomId, playerColor, handleGameUpdate);

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

    // Watch room status (waiting → playing)
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

    // Init chess engine
    const chess = new Chess();
    chessRef.current = chess;

    // Init renderer
    const renderer = new ChessRenderer(containerRef.current, {
      app: { backgroundAlpha: 0 },
      viewport: { drag: true, wheel: true, pinch: true },
    }, {
      // Steam-like dark palette
      background: 0x0d0d1a,
      whiteTile: 0x2a3a5c,
      blackTile: 0x1a1a35,
      whiteTimeline: 0x1e3050,
      blackTimeline: 0x2a1a3a,
      whitePiece: 0xf0e6d0,
      blackPiece: 0x2a1020,
      move: 0x4a7ab5,
      capture: 0xb54a4a,
      pastMove: 0x3a5a8a,
      pastCapture: 0x8a3a3a,
      check: 0xc8a84b,
    });
    rendererRef.current = renderer;

    renderer.global.sync(chess);

    // Listen for move selection from renderer
    renderer.on('move', (move) => {
      if (!isMounted.current) return;
      const turn = chess.player === 0 ? 'white' : 'black';
      if (turn !== playerColor) return; // not your turn

      try {
        chess.move(move);
        renderer.global.sync(chess);
        setMoveBuffer(chess.moveBuffer ? [...chess.moveBuffer] : []);
        updateUIState(chess);
      } catch (e) {
        console.warn('Invalid move:', e);
      }
    });

    return () => {
      renderer.destroy();
      rendererRef.current = null;
      chessRef.current = null;
    };
  }, [status, playerColor]);

  function handleSubmit() {
    const chess = chessRef.current;
    const renderer = rendererRef.current;
    if (!chess || !renderer) return;
    if (chess.player !== (playerColor === 'white' ? 0 : 1)) return;
    if (!chess.moveBuffer || chess.moveBuffer.length === 0) return;

    try {
      chess.submit();
      renderer.global.sync(chess);
      updateUIState(chess);
      // Push to Firebase
      pushMove(chess.actionHistory, null);
    } catch (e) {
      console.warn('Submit failed:', e);
    }
  }

  function handleUndo() {
    const chess = chessRef.current;
    const renderer = rendererRef.current;
    if (!chess || !renderer) return;

    try {
      chess.undo();
      renderer.global.sync(chess);
      updateUIState(chess);
    } catch (e) {
      console.warn('Undo failed:', e);
    }
  }

  const isMyTurn = currentTurn === playerColor;

  return (
    <div className="game">
      {/* Header */}
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

      {/* Waiting overlay */}
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

      {/* Board */}
      <div className="game-body">
        <div className="board-container" ref={containerRef} />

        {/* Side panel */}
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
            <button
              className="action-btn submit-btn"
              onClick={handleSubmit}
              disabled={!isMyTurn || moveBuffer.length === 0}
            >
              Submit Turn
            </button>
            <button
              className="action-btn undo-btn"
              onClick={handleUndo}
              disabled={!isMyTurn || moveBuffer.length === 0}
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
