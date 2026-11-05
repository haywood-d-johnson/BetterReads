# BetterReads Mobile (Expo / React Native)

A React Native (Expo) client for BetterReads. It talks to the same Express API as the web
client (`server/`) — no backend changes required. This first version covers the **MVP**:
sign in, search Open Library, **scan ISBN barcodes** to add books, manage your library and
shelves, and track reading progress, ratings, and reviews.

> 📱 **Running it, especially over mobile data?** See **[RUNNING.md](RUNNING.md)** — a complete
> runbook with the full mobile-data flow, Expo auth, and a troubleshooting table keyed by the
> exact error text (SDK mismatch, tunnel auth, `Network request failed`, `401`, and more).

## Prerequisites

- Node 18+.
- **Install the mobile app's dependencies** (it keeps its own `node_modules` and is
  intentionally **not** an npm workspace — that avoids Expo/Metro dependency-hoisting
  issues). From the repo root:

  ```bash
  npm run install:mobile   # or: cd mobile && npm install
  ```

- The **BetterReads API server running** (`npm run dev:server` from the repo root → port 3001).
- The **Expo Go** app on your phone (iOS/Android), or an Android emulator / iOS simulator.

## Configure the API URL

Metro injects `EXPO_PUBLIC_API_URL` at build time. Copy the example and set it:

```bash
cp mobile/.env.example mobile/.env
```

Then edit `mobile/.env`:

| Running the app on…        | `EXPO_PUBLIC_API_URL`                |
| -------------------------- | ------------------------------------ |
| Physical phone (Expo Go)   | `http://<your-PC-LAN-IP>:3001`       |
| Android emulator           | `http://10.0.2.2:3001`               |
| iOS simulator / web        | `http://localhost:3001`              |

> **A physical phone cannot reach `localhost`** — that points at the phone itself. Find your
> PC's LAN IP with `ipconfig` (Windows) and make sure the phone is on the same Wi-Fi.

## Run it

From the repo root — **same Wi-Fi** as your PC:

```bash
npm run dev:mobile
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS), or press `a` / `i` for an
emulator. Log in with the seeded admin credentials (see `server/` `ADMIN_USERNAME` /
`ADMIN_PASSWORD` in the root `.env`).

### Running over mobile data (phone not on your Wi-Fi)

On cellular, the phone can reach neither Metro nor your local API by LAN IP, so **both** must
be exposed over the internet:

1. **Metro → tunnel mode** (routes the bundler through ngrok; `@expo/ngrok` is already a
   dev dependency, so it works offline-of-LAN without a flaky auto-install):

   ```bash
   npm run dev:mobile:tunnel
   ```

   > The script uses the **ngrok** provider (`expo start --tunnel ngrok`) on purpose. Expo's
   > newer default "signed tunnel" is a hosted service that needs account access and fails
   > with *"Couldn't create a signed tunnel URL"* on many accounts; ngrok is the reliable
   > fallback. Authenticate non-interactively with an `EXPO_TOKEN`
   > (from https://expo.dev/settings/access-tokens) to avoid the Windows browser-login bug:
   > `EXPO_TOKEN="…" npm run dev:mobile:tunnel`.

2. **API → a public URL.** Point `EXPO_PUBLIC_API_URL` at a reachable host, not a LAN IP:
   - **Easiest:** your deployed API (this repo ships a Vercel config that serves the Express
     app at `/api/*`) → `EXPO_PUBLIC_API_URL=https://<your-app>.vercel.app`.
   - **Or tunnel the local server** on port 3001, e.g. `npx tunnelmole 3001` or
     `cloudflared tunnel --url http://localhost:3001`, and use that `https://…` URL.

> `EXPO_PUBLIC_*` values are baked in when the bundle builds, so after editing `mobile/.env`
> restart with a cleared cache: `npm run dev:mobile:tunnel -- --clear`.
>
> This project targets **Expo SDK 58**, matching the current Expo Go. If a future Expo Go
> update bumps past SDK 58, re-align with `npx expo install expo@latest && npx expo install --fix`.

## What's here

```
app/
  _layout.jsx          providers + auth gate (replaces web ProtectedRoute)
  login.jsx            sign in
  (tabs)/index.jsx     dashboard (currently reading / recently added)
  (tabs)/search.jsx    Open Library search + add to library
  (tabs)/library.jsx   shelves filter + book grid
  book/[id].jsx        detail: rating, progress, shelf, review, remove
src/
  api/                 ported from client/src/api (SecureStore token, absolute base URL)
  context/AuthContext  JWT session, same shape as the web app
  components/           native UI (BookCover, StarRating, SearchBar, ...)
  theme.js             mirrors the web "Botanical Sage" light theme
```

The token is stored with **expo-secure-store** on device (falls back to `localStorage` on
web). A 401 from any request clears the session and returns you to the login screen.

## Not yet ported (planned next)

Stats charts (recharts → `react-native-gifted-charts`), book-location maps (leaflet →
`react-native-maps`), author pages, reader (me/partner) toggle, and dark mode.

**Shipped since MVP:** ISBN barcode scanning (`expo-camera`) — tap the barcode button on the
Search tab to scan a book's EAN-13/UPC and look it up. Camera works in Expo Go (no dev build
needed); the permission prompt text lives in `app.json` under the `expo-camera` plugin.
