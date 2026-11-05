# Running BetterReads Mobile — Complete Runbook

Everything you need to run the Expo app, especially **over mobile data**, plus every error
we hit getting there and exactly how each was fixed. If something breaks, jump to
[Troubleshooting](#troubleshooting) — it's keyed by the literal error text.

---

## 1. The mental model (read this once)

The mobile app has **two independent network dependencies**, and on mobile data *both* must
be reachable from the phone over the public internet:

| Piece | What it is | Port | How the phone reaches it |
| --- | --- | --- | --- |
| **Metro bundler** | Serves the JS bundle to Expo Go | 8081 | Expo **tunnel** (ngrok) |
| **API server** | The Express backend (`server/`) | 3001 | A **public URL** (tunnelmole or Vercel) via `EXPO_PUBLIC_API_URL` |

On the **same Wi-Fi**, both can be reached by your PC's LAN IP and you can skip the tunnels.
On **mobile data**, the phone is on a different network, so `localhost` and LAN IPs are
useless — hence two tunnels (or one tunnel + a deployed API).

> **Why `localhost` never works from the phone:** on the phone, `localhost`/`127.0.0.1` means
> *the phone itself*, not your PC. This is the single most common first-run mistake.

---

## 2. One-time setup

```bash
# from the repo root — installs the mobile app's own node_modules
npm run install:mobile
```

The mobile app is a **standalone project** (its own `node_modules`), intentionally **not** an
npm workspace. See [Why standalone](#why-standalone-not-a-workspace) for the reason.

You also need, on your phone, the **Expo Go** app (iOS App Store / Google Play). Expo Go
auto-updates and only supports the **latest** Expo SDK — see
[Keeping up with Expo Go's SDK](#keeping-up-with-expo-gos-sdk).

---

## 3. Running on the SAME Wi-Fi (simplest)

1. Start the API server (from repo root): `npm run dev:server` → listens on `:3001`.
2. Set `mobile/.env`:
   ```
   EXPO_PUBLIC_API_URL=http://<your-PC-LAN-IP>:3001
   ```
   Find your LAN IP with `ipconfig` (Windows) — e.g. `http://192.168.1.50:3001`.
3. Start Metro (from repo root): `npm run dev:mobile`.
4. Scan the QR with the Camera app (iOS) or Expo Go (Android).

Emulator/simulator shortcuts for the API URL:
- Android emulator: `http://10.0.2.2:3001`
- iOS simulator / web: `http://localhost:3001`

---

## 4. Running over MOBILE DATA (the full flow)

You need **three** things running and one config value. Here is the whole sequence.

### Terminal A — API server
```bash
npm run dev:server
```

### Terminal B — expose the API publicly
```bash
npx tunnelmole 3001
```
Copy the `https://…tunnelmole.net` URL it prints.

> ⚠️ **tunnelmole's free URL changes every run.** Whenever you restart tunnelmole you MUST
> update `mobile/.env` with the new URL and restart Metro with `--clear` (step below).
> A deployed **Vercel** API avoids this entirely (see [API options](#api-options)).

### `mobile/.env` — point the app at that URL
```
EXPO_PUBLIC_API_URL=https://<your-id>.tunnelmole.net
```
Rules: use the **https** URL, **no trailing slash**. `EXPO_PUBLIC_*` values are **baked into
the bundle at build time**, so a running Metro will NOT pick up edits — you must restart with
`--clear` after any change here.

### Terminal C — Metro through an ngrok tunnel
```bash
npm run dev:mobile:tunnel
```
(that runs `expo start --tunnel ngrok` inside `mobile/`). First run pauses a few seconds
while ngrok sets up, then shows the QR code.

> If you edited `mobile/.env`, start it with a cache clear instead:
> ```bash
> npm run dev:mobile:tunnel -- --clear
> ```

### On the phone
Scan the QR with the Camera app (iOS) / Expo Go (Android), wait for the bundle to download,
then log in (see [App login](#app-login-credentials)).

---

## 5. Expo authentication (required for tunnel mode)

Tunnel mode (both the default "signed" tunnel and the ngrok tunnel) requires you to be
**signed into an Expo account**. Two ways to authenticate, both avoiding the broken Windows
browser-login popup:

### Option A — username/password login (recommended)
```bash
npx expo login --no-browser
```
**Type** your username and password at the prompts (don't paste — see
[bracketed paste](#the-bracketed-paste-gremlin)). Add the 2FA code if prompted. This writes a
durable session to `~/.expo/state.json`, so you won't need a token at all. Verify:
```bash
npx expo whoami
```

### Option B — access token
1. Create a token at https://expo.dev/settings/access-tokens.
2. Set it **paste-safe** (disable bracketed paste first, then paste):
   ```bash
   printf '\e[?2004l'; read -rs EXPO_TOKEN; export EXPO_TOKEN
   printf '\ninvalid_chars=%s length=%s\n' "$(printf %s "$EXPO_TOKEN" | tr -d 'A-Za-z0-9_-' | wc -c)" "$(printf %s "$EXPO_TOKEN" | wc -c)"
   ```
   You want `invalid_chars=0`. If it's anything else, the pasted value is polluted — don't use it.
3. Run the tunnel in the **same** shell: `npm run tunnel`.

> **Do not put `EXPO_TOKEN` in `~/.bashrc` via copy-paste.** That's how we got a token full of
> invisible escape bytes. If you want it persistent, prefer Option A's session, or write the
> token to `~/.bashrc` by typing it, not pasting.

---

## 6. App login credentials

The **app's** login (not your Expo login) uses the single seeded user from the backend:

- **Username:** value of `ADMIN_USERNAME` in the root `.env` (currently `earthtolizzy`).
- **Password:** value of `ADMIN_PASSWORD` in the root `.env`.

These are the same credentials as the web client. A wrong password shows up as **`401
Unauthorized`** on the `/api/books…` calls right after the login screen.

---

## 7. API options

| Option | Pros | Cons |
| --- | --- | --- |
| **Deployed Vercel API** (`https://<app>.vercel.app`) | Always up, stable URL, no second tunnel | Must deploy; uses the deployed DB |
| **tunnelmole** (`npx tunnelmole 3001`) | Uses your live local server + DB | URL rotates every run; another terminal |
| **cloudflared** (`cloudflared tunnel --url http://localhost:3001`) | Stable-ish, robust | Requires cloudflared installed |

The repo already ships a `vercel.json` that serves the Express app as a serverless function
at `/api/*`, so the Vercel option is mostly "deploy and point `EXPO_PUBLIC_API_URL` at it."
The server uses open CORS (`app.use(cors())`), so no server change is needed for any option.

---

## 8. Keeping up with Expo Go's SDK

Expo Go only runs the **latest** SDK and auto-updates. If you open the project and see
**"Project is incompatible with this version of Expo Go"**, your Expo Go moved ahead of the
project. Re-align:

```bash
cd mobile
npx expo install expo@latest
npx expo install --fix
```

Then re-bundle to confirm nothing broke:
```bash
npx expo export --platform android --output-dir dist   # should exit 0; delete dist/ after
```

This project was built on SDK 54 and already upgraded to **SDK 58** this way (zero code
changes were needed — the expo-router / expo-secure-store / expo-image APIs were stable).

**Permanent escape hatch:** a **custom dev build** (`npx eas build --profile development`)
pins the native runtime to *your* project, so Expo Go's version no longer matters. It needs a
one-time EAS build (and an Expo login). Worth it if the SDK roulette gets annoying.

**Network escape hatch:** **Tailscale** on your PC + phone gives the phone a stable private IP
to your PC over *any* network (including cellular) — then you can use plain `npm run
dev:mobile` with that IP and skip Expo tunnels and ngrok auth entirely.

---

## 9. Why standalone (not a workspace)

`mobile/` keeps its own `node_modules` and is **not** in the root `workspaces` array. When it
*was* a workspace, npm hoisted part of the Expo toolchain to the repo root and left other
parts nested, which silently broke `babel-preset-expo`'s detection of `expo-router` — the
bundle failed with `process.env.EXPO_ROUTER_APP_ROOT` not being inlined. Making the app
standalone keeps the whole Expo toolchain co-located and durable. The tradeoff is a separate
`node_modules` and installing via `npm run install:mobile` instead of the root install.

`babel-preset-expo` is also pinned as an explicit devDependency so Babel can always resolve
it from `mobile/node_modules` (npm otherwise nests it under `expo/node_modules`, where Babel
can't find it).

---

## Troubleshooting

Keyed by the literal error text.

### `Project is incompatible with this version of Expo Go` (SDK 58 vs SDK 54, etc.)
Expo Go is newer than the project. Upgrade the project — see
[Keeping up with Expo Go's SDK](#keeping-up-with-expo-gos-sdk).

### `Couldn't create a signed tunnel URL for this project`
Expo's default hosted tunnel isn't available to your account. Use the ngrok provider instead
— which is what `npm run dev:mobile:tunnel` already does (`expo start --tunnel ngrok`). If you
run Expo directly, add ` ngrok`: `npx expo start --tunnel ngrok`.

### `Invalid character in header content ["authorization"]`
Your `EXPO_TOKEN` contains an illegal byte (a carriage return `\r` from a CRLF file, or
invisible **bracketed-paste** markers `ESC[200~…ESC[201~` from pasting into a prompt). Fixes,
in order of preference:
1. Stop using a token — log in with `npx expo login --no-browser` (Option A above).
2. If you must use a token, set it paste-safe (Option B above) and confirm `invalid_chars=0`.
3. Purge the bad one: `unset EXPO_TOKEN` and `sed -i '/EXPO_TOKEN/d' ~/.bashrc`.

### `Cannot determine the project's Expo SDK version because the module 'expo' is not installed`
You ran an `expo`/`npx expo` command from the **repo root**, where there's no `expo`. Run it
from `mobile/` (or use the root scripts `npm run dev:mobile` / `dev:mobile:tunnel`, which
`cd` into `mobile/` for you).

### `Missing script: "dev:mobile:tunnel"`
`dev:mobile:tunnel` is a **root** script. From inside `mobile/` the equivalent is
`npm run tunnel`. From the repo root use `npm run dev:mobile:tunnel`.

### Login fails / `401 Unauthorized` on `/api/books…` right after login
Wrong **app** credentials (not Expo). Use `ADMIN_USERNAME` / `ADMIN_PASSWORD` from the root
`.env` — see [App login](#app-login-credentials).

### `Network request failed. Is the API reachable at …?`
The app can't reach your API. Usually one of:
- `EXPO_PUBLIC_API_URL` is unset or points at `localhost`/a LAN IP while the phone is on
  mobile data. Point it at a public URL (tunnelmole/Vercel) and restart Metro with `--clear`.
- tunnelmole was restarted and its URL changed, but `mobile/.env` still has the old one.
- You edited `mobile/.env` but didn't restart Metro with `--clear` (the value is baked in at
  build time).

### `Cannot find module 'babel-preset-expo'`
`babel-preset-expo` isn't at the top level of `mobile/node_modules`. It's pinned as a
devDependency for this reason — run `npm run install:mobile`. If it persists, the repo root
may have a stale copy shadowing it: from the repo root run `npm install` (prunes it), then
`npm run install:mobile`.

### Metro bundling fails after a dependency change
Clear the cache: `npm run dev:mobile:tunnel -- --clear` (or `npx expo start --clear`), and if
needed delete `mobile/.expo` and re-run.

### `git status` warns `Filename too long` under `mobile/node_modules`
Harmless — `node_modules` is gitignored and not committed. (Some Expo prebuilt frameworks
have very deep paths. If a future tool needs to traverse them, enable long paths:
`git config --system core.longpaths true`.)

---

## The bracketed-paste gremlin

Modern terminals wrap pasted text in invisible markers — `ESC[200~` before and `ESC[201~`
after (bracketed paste mode). When you paste a secret into a prompt that reads raw bytes
(like `read`), those markers become part of the value. For a token that means an illegal
`ESC` byte in the `Authorization` header → `Invalid character in header content`.

Avoid it by **typing** secrets, or disable bracketed paste before pasting:
```bash
printf '\e[?2004l'   # turn bracketed paste OFF for this terminal
```
Re-enable with `printf '\e[?2004h'` (or just open a new terminal).

---

## Quick reference

```bash
# one-time
npm run install:mobile

# same Wi-Fi
npm run dev:server                 # terminal A
npm run dev:mobile                 # terminal B  (set mobile/.env to http://<LAN-IP>:3001)

# mobile data
npm run dev:server                 # terminal A
npx tunnelmole 3001                # terminal B  -> copy https URL into mobile/.env
npx expo login --no-browser        # once, if not logged in
npm run dev:mobile:tunnel -- --clear   # terminal C  (after editing mobile/.env)

# app login: ADMIN_USERNAME / ADMIN_PASSWORD from root .env
# Expo Go says "incompatible SDK"?  cd mobile && npx expo install expo@latest && npx expo install --fix
```
