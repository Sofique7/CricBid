# Live multiplayer storage (Vercel)

Use **Redis** (Upstash) on Vercel — see step-by-step in the project README or ask in chat.

Vercel injects `KV_REST_API_URL` / `KV_REST_API_TOKEN` or `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` automatically after you connect a database and redeploy.

**Local testing with KV:** link the same KV store to a Vercel env pull, or use Firebase / `npm run dev` (Socket.io).
