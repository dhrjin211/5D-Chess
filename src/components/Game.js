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
  const [submitError, setSubmitError] = useState('');
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
        console.error('Sync failed:', e);
      }
    }
  }, []);

  const { pushMove } = useFirebaseGame(roomId, playerColor, handleGameUpdate);

  function syncRenderer(chess) {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.global.sync(chess);
    // chess.player returns 'white' or 'black' string
    if (chess.player === playerColorRef.current) {
      try { renderer.global.availableMoves(chess.moves('all')); }
      catch(e) { renderer.global.availableMoves([]); }
    } else {
      renderer.global.availableMoves([]);
    }
  }

  function updateUIState(chess) {
    if (!isMounted.current) return;
    // chess.player is 'white' or 'black' - who needs to move NEXT
    setCurrentTurn(chess.player);
    setMoveBuffer(chess.moveBuffer ? [...chess.moveBuffer] : []);
    setInCheck(!!(chess.inCheck && chess.inCheck.length > 0));
    if (chess.isCheckmate) {
      setGameStatus(chess.player === 'white' ? '⚔ Black wins!' : '⚔ White wins!');
    } else if (chess.isStalemate) {
      setGameStatus('Draw by stalemate');
    } else if (chess.inCheck && chess.inCheck.length > 0) {
      setGameStatus('⚠ Check!');
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
      // chess.player is 'white' or 'black'
      if (chess.player !== playerColorRef.current) return;
      setSubmitError('');
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
    if (!chess.moveBuffer || chess.moveBuffer.length === 0) {
      setSubmitError('Stage at least one move first.');
      return;
    }
    setSubmitError('');
    try {
      chess.submit();
      syncRenderer(chess);
      updateUIState(chess);
      pushMove(serializeHistory(chess.actionHistory));
    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      if (msg.includes('more moves are needed')) {
        setSubmitError('Must move on every active timeline before submitting.');
      } else if (msg.includes('in check')) {
        setSubmitError('Cannot submit — you are in check! Move your king out of check first.');
      } else {
        setSubmitError(msg);
      }
      console.error('Submit error:', e);
    }
  }

  function handleUndo() {
    const chess = chessRef.current;
    if (!chess) return;
    setSubmitError('');
    try {
      chess.undo();
      syncRenderer(chess);
      updateUIState(chess);
    } catch (e) {
      console.warn('Undo failed:', e);
    }
  }

  const hasStagedMoves = moveBuffer.length > 0;
  const isMyTurn = currentTurn === playerColor || hasStagedMoves;

  return (
    <div className="game">
      <div className="game-header">
        <div className="game-header-left">
          <div className="game-logo-block">
            <span className="game-logo">5D CHESS</span>
            <span className="game-logo-sub">MULTIVERSE TIME TRAVEL</span>
          </div>
        </div>
        <div className="game-header-center">
          {gameStatus && (
            <span className={`game-status-badge ${inCheck ? 'check' : ''}`}>{gameStatus}</span>
          )}
        </div>
        <div className="game-header-right">
          <span className="game-room-code">ROOM {roomId}</span>
          <button className="btn-leave" onClick={onLeave}>✕ Leave</button>
        </div>
      </div>

      {status === 'waiting' && (
        <div className="waiting-overlay">
          <div className="waiting-card">
            <div className="waiting-spinner" />
            <h2>Waiting for Opponent</h2>
            <p>Share this room code:</p>
            <div className="waiting-code">{roomId}</div>
            <p className="waiting-sub">You are playing as <strong className="color-badge">{playerColor}</strong></p>
          </div>
        </div>
      )}

      <div className="game-body">
        <div className="board-container" ref={containerRef} />
        <div className="side-panel">
          <div className="player-row">
            <div className={`color-pip ${playerColor === 'white' ? 'black' : 'white'} ${!isMyTurn ? 'active' : ''}`} />
            <div className="player-info">
              <span className="player-label">OPPONENT</span>
              <span className="player-color-name">{playerColor === 'white' ? 'Black' : 'White'}</span>
            </div>
            {!isMyTurn && <span className="thinking-dots"><span>.</span><span>.</span><span>.</span></span>}
          </div>

          <div className="panel-divider" />

          <div className="turn-block">
            <div className={`turn-badge ${isMyTurn ? 'active' : 'inactive'}`}>
              {isMyTurn ? '◆ YOUR TURN' : '◇ WAITING'}
            </div>
            {hasStagedMoves && (
              <div className="staged-info">
                {moveBuffer.length} move{moveBuffer.length > 1 ? 's' : ''} staged — cover all timelines then submit
              </div>
            )}
            {submitError && <div className="submit-error">{submitError}</div>}
          </div>

          <div className="panel-divider" />

          <div className="actions-block">
            <button className="btn-submit" onClick={handleSubmit} disabled={moveBuffer.length === 0}>
              <span className="btn-icon">⏎</span> Submit Turn
            </button>
            <button className="btn-undo" onClick={handleUndo} disabled={moveBuffer.length === 0}>
              ↩ Undo Move
            </button>
          </div>

          <div className="panel-divider" />

          <div className="help-block">
            <div className="help-title">HOW TO PLAY</div>
            <div className="help-item"><span className="help-key">Click</span> a piece to see valid moves</div>
            <div className="help-item"><span className="help-key">Click</span> a highlighted square to move</div>
            <div className="help-item"><span className="help-key">Drag</span> to pan across timelines</div>
            <div className="help-item"><span className="help-key">Scroll</span> to zoom in/out</div>
            <div className="help-item">Cover <em>all active timelines</em> then submit</div>
          </div>

          <div className="panel-divider" />

          <div className="player-row">
            <div className={`color-pip ${playerColor} ${isMyTurn ? 'active' : ''}`} />
            <div className="player-info">
              <span className="player-label">YOU</span>
              <span className="player-color-name">{playerColor.charAt(0).toUpperCase() + playerColor.slice(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
