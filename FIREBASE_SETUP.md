# Firebase multiplayer setup (CricBid)

Multiplayer uses **Firebase Realtime Database** so rooms work on Vercel without a Socket.io server.

## 1. Create Firebase project

1. Open [Firebase Console](https://console.firebase.google.com) and create a project (or use an existing one).
2. Add a **Web app** and copy the config object.

## 2. Enable Realtime Database

1. In the console: **Build → Realtime Database → Create database**.
2. Start in **test mode** for development, or deploy rules from this repo:

   ```bash
   npx -y firebase-tools@latest deploy --only database
   ```

   (Requires `firebase init` linked to your project first.)

## 3. Environment variables

Copy `.env.example` to `.env.local` and fill in values from the Firebase web app config.

On **Vercel**: Project → Settings → Environment Variables → add the same `NEXT_PUBLIC_FIREBASE_*` keys for Production (and Preview if needed), then redeploy.

## 4. Run locally

```bash
npm install
npm run dev
```

Use `next dev` (not `server.js`). Socket.io is no longer used.

## Notes

- The **host** client runs the auction timer and writes ticks to Firebase.
- `database.rules.json` is open for demo use; tighten rules (auth, validation) before production traffic.
