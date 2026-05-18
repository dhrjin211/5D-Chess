import { useEffect, useRef, useCallback } from 'react';
import { ref, set, onValue, update, get } from 'firebase/database';
import { db } from '../firebase';

export function useFirebaseGame(roomId, playerColor, onGameUpdate) {
  const listenerRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    const gameRef = ref(db, `rooms/${roomId}/game`);
    const unsub = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        onGameUpdate(data);
      }
    });

    listenerRef.current = unsub;
    return () => unsub();
  }, [roomId, onGameUpdate]);

  const pushMove = useCallback(async (actionHistory, board) => {
    if (!roomId) return;
    await update(ref(db, `rooms/${roomId}/game`), {
      actionHistory,
      board,
      lastUpdated: Date.now(),
    });
  }, [roomId]);

  const pushStatus = useCallback(async (status) => {
    if (!roomId) return;
    await update(ref(db, `rooms/${roomId}`), { status });
  }, [roomId]);

  return { pushMove, pushStatus };
}

export async function createRoom(roomId) {
  await set(ref(db, `rooms/${roomId}`), {
    status: 'waiting',
    created: Date.now(),
    game: {
      actionHistory: [],
      board: null,
      lastUpdated: Date.now(),
    },
  });
}

export async function joinRoom(roomId) {
  const snap = await get(ref(db, `rooms/${roomId}`));
  if (!snap.exists()) return null;
  const data = snap.val();
  if (data.status === 'playing') return null; // full
  await update(ref(db, `rooms/${roomId}`), { status: 'playing' });
  return data;
}

export function watchRoomStatus(roomId, callback) {
  const roomRef = ref(db, `rooms/${roomId}/status`);
  return onValue(roomRef, (snap) => callback(snap.val()));
}
