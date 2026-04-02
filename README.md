# Dragon's Den

Dragon's Den is a production-focused static web app (Vite + vanilla JS ES modules) designed for GitHub Pages with Firebase Authentication, Firestore, and optional Storage.

## Features
- Email/password auth: register, login, logout, password reset, email verification notice.
- Role-aware UX with `player`, `admin`, `superadmin`.
- Hash router (`#/route`) for GitHub Pages deep-link reliability.
- Dashboard with hero + patch notes from Firestore.
- Store + cart + purchase transaction flow with Firestore transaction safety.
- Inventory system for purchased/manual/loot sources.
- Admin console for products, loot, admin codes, developer notes, and superadmin role management.
- Poker module with isolated game engine and persisted outcomes.
- Currency system (gold/silver + 10:1 silver-to-gold conversion) via transaction updates.

## Tech Stack
- Vite + Vanilla JavaScript (ES modules)
- Firebase modular SDK
- Firestore security rules + indexes
- Firebase Storage rules

## Local Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Fill `.env` with your Firebase web app config.
4. Start dev server:
   ```bash
   npm run dev
   ```

## Environment Variables
Required Vite vars:
- `VITE_BASE_PATH`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Manual Firebase Console Setup (Required)
1. Create a Firebase project.
2. Register a Web app.
3. Copy the Firebase web config into `.env`.
4. Enable **Authentication > Sign-in method > Email/Password**.
5. Add authorized domains in Authentication settings:
   - `localhost` (for local dev)
   - `<username>.github.io`
   - your custom domain (optional)
6. Create Firestore database in **production mode**.
7. Publish Firestore rules (`firestore.rules`).
8. Publish Storage rules (`storage.rules`).
9. If uploads are used, enable Firebase Storage.
10. Deploy rules + indexes:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```
11. Deploy app to GitHub Pages.


## Blank Screen Troubleshooting
If you see a white/blank page, open browser DevTools Console first. Most common causes:

1. Missing Firebase env vars in `.env` (app now shows setup errors instead of failing silently).
2. Dependencies not installed (`npm install` was not run).
3. Firebase Auth domain not authorized for your current host.
4. Firestore/Storage rules not deployed yet.

Required first deploy commands:
```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

For development:
```bash
npm install
npm run dev
```

## Data Model
Top-level collections:
- `users`
- `products`
- `inventory`
- `dmLoot`
- `adminCodes`
- `developerNotes`
- `transactions`
- `pokerStats`
- `appSettings`

## Security Model
- Role checks are sourced from `users/{uid}`.
- Players cannot self-upgrade roles.
- Players cannot directly change gold/silver fields.
- Admin-managed collections require admin role.
- Superadmin operations (global user management/settings) are restricted.

## GitHub Pages Deployment
This project uses Vite build output and hash routing.

1. Set base path for repo page deployment in `.env`:
   ```bash
   VITE_BASE_PATH=/your-repo-name/
   ```
2. Build:
   ```bash
   npm run build
   ```
3. Publish `dist/` using GitHub Pages (Actions or `gh-pages` CLI).
4. Ensure your Firebase auth authorized domain includes `<username>.github.io`.

## Suggested GitHub Actions Deploy
Use a workflow that builds with Node, runs `npm ci && npm run build`, then uploads `dist` to Pages.

## Notes
- All sensitive state transitions (purchase, poker payout, admin code redemption, silver->gold conversion) use Firestore transactions in client logic.
- Firestore rules remain the ultimate enforcement layer.
