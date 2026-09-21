# 🏰 Shadow Empire — Deployment Guide

Your game is a **Vite + React frontend** backed by a **Convex cloud backend** (database + game logic + cron jobs). To host it yourself you need both parts.

---

## Part 1 — Deploy the backend (Convex)

The backend is *not* in this zip — it lives on Convex. You have two options:

### Option A: Use your existing backend (fastest)
Your production backend already exists:
```
https://precious-shrimp-648.eu-west-1.convex.cloud
```
Use that URL as `VITE_CONVEX_URL` in Part 2. Nothing else to do.

### Option B: Fresh backend (own account)
```bash
npm install
npx convex dev --once        # creates a new deployment, pushes all functions & schema
```
Follow the login prompt, then note your new deployment URL from the output.

> Bots/crons: your cron jobs (`tickBots`, roster refill, bot DMs) deploy automatically with the functions.

---

## Part 2 — Build the frontend

```bash
npm install
VITE_CONVEX_URL=https://<your-convex-deployment>.convex.cloud npm run build
```

Or create a `.env` file next to `package.json`:
```
VITE_CONVEX_URL=https://precious-shrimp-648.eu-west-1.convex.cloud
```
…then just run `npm run build`.

The finished site ends up in **`dist/`** — that folder is your entire frontend.

---

## Part 3 — Host the `dist/` folder

Any static host works:

| Host | Command |
|---|---|
| Netlify | `npx netlify deploy --prod --dir=dist` |
| Vercel | `npx vercel --prod` (set build: `npm run build`, output: `dist`) |
| Cloudflare Pages | Connect repo, build `npm run build`, output `dist` |
| VPS (nginx) | Copy `dist/*` to your webroot |

### SPA routing (important!)
The game uses client-side routes (`/auth`, `/dashboard`). Configure your host to serve `index.html` for all routes:

**Netlify/Vercel:** automatic.
**nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```
**Cloudflare Pages:** add a `_redirects` file in `public/` containing `/* /index.html 200`.

---

## Checklist

- [ ] `VITE_CONVEX_URL` set to your Convex deployment URL before building
- [ ] SPA fallback configured (all routes → `index.html`)
- [ ] Test: register a player, send a message, run a crime — if the game loads but actions fail, the Convex URL is wrong
- [ ] Your admin account (`medusa1414`) lives on the Convex backend — using a fresh backend means re-promoting yourself admin in-game
