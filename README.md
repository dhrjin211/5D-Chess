# 5D Chess Online

Multiplayer **5D Chess With Multiverse Time Travel** — no account required. Create a room, share the code with a friend, play.

Built with `5d-chess-js` (engine) + `5d-chess-renderer` (PIXI.js board) + Firebase Realtime Database (sync).

---

## Setup

### 1. Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project (or use existing)
3. Enable **Realtime Database** → Start in test mode
4. Copy your database URL (looks like `https://your-project-default-rtdb.firebaseio.com`)

### 2. Environment variables

Create a `.env` file in the root (copy from `.env.example`):

```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

### 3. Install & run locally

```bash
npm install
npm start
```

---

## Deploy to Vercel via GitHub

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. In Vercel project settings → **Environment Variables**, add all `REACT_APP_*` vars from your `.env`
4. Deploy — done. Share the URL with your friend.

> ⚠️ Never commit your `.env` file. It's in `.gitignore` already.

---

## How to play

- **Create Room** → share the 8-character code with your friend
- Friend clicks **Join Room** → enters the code
- Game starts automatically when both players are connected
- Click a piece → click a highlighted square to move
- You can make multiple moves across timelines before submitting
- Press **Submit Turn** when you're done with your action
- Scroll/pinch to zoom, drag to pan across timelines

---

## Tech stack

| Layer | Library |
|---|---|
| Game engine | [5d-chess-js](https://gitlab.com/5d-chess/5d-chess-js) |
| Board renderer | [5d-chess-renderer](https://gitlab.com/5d-chess/5d-chess-renderer) |
| Realtime sync | Firebase Realtime Database |
| UI | React 18 |
| Fonts | Cinzel + Inter (Google Fonts) |

---

*Ruleset from 5D Chess With Multiverse Time Travel by Thunkspace LLC.*
