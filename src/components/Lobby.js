import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createRoom, joinRoom } from '../hooks/useFirebaseGame';
import './Lobby.css';

export default function Lobby({ onJoin }) {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    setLoading(true);
    setError('');
    const id = uuidv4().slice(0, 8).toUpperCase();
    await createRoom(id);
    setCreatedCode(id);
    setLoading(false);
    // Host is white
    onJoin(id, 'white', true);
  }

  async function handleJoin() {
    if (!joinCode.trim()) return;
    setLoading(true);
    setError('');
    const code = joinCode.trim().toUpperCase();
    const result = await joinRoom(code);
    if (!result) {
      setError('Room not found or already full.');
      setLoading(false);
      return;
    }
    // Joiner is black
    onJoin(code, 'black', false);
    setLoading(false);
  }

  function copyCode() {
    navigator.clipboard.writeText(createdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="lobby">
      <div className="lobby-bg" />
      <div className="lobby-content">
        <div className="lobby-title-block">
          <div className="lobby-subtitle">MULTIVERSE TIME TRAVEL</div>
          <h1 className="lobby-title">5D CHESS</h1>
          <div className="lobby-divider" />
          <p className="lobby-tagline">Move through space, time, and parallel realities</p>
        </div>

        <div className="lobby-panels">
          <div className="lobby-panel">
            <h2>Create Game</h2>
            <p className="panel-desc">Start a new room and share the code with your opponent</p>
            <button
              className="btn btn-primary"
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>
            {createdCode && (
              <div className="code-display">
                <span className="code-label">Share this code</span>
                <div className="code-box" onClick={copyCode}>
                  <span className="code-text">{createdCode}</span>
                  <span className="code-copy">{copied ? '✓ Copied' : 'Click to copy'}</span>
                </div>
                <span className="code-waiting">⟳ Waiting for opponent...</span>
              </div>
            )}
          </div>

          <div className="lobby-separator">
            <span>OR</span>
          </div>

          <div className="lobby-panel">
            <h2>Join Game</h2>
            <p className="panel-desc">Enter the room code your opponent shared with you</p>
            <input
              className="code-input"
              type="text"
              placeholder="Enter room code"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              maxLength={8}
            />
            <button
              className="btn btn-secondary"
              onClick={handleJoin}
              disabled={loading || !joinCode.trim()}
            >
              {loading ? 'Joining...' : 'Join Room'}
            </button>
            {error && <span className="error-msg">{error}</span>}
          </div>
        </div>

        <div className="lobby-footer">
          <p>Based on the ruleset of <em>5D Chess With Multiverse Time Travel</em> by Thunkspace LLC</p>
        </div>
      </div>
    </div>
  );
}
