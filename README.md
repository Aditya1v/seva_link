# ReliefSync AI

ReliefSync is a full-stack app for coordinating NGO relief work and volunteers.

- `client/`: Vite + React frontend
- `server/`: Node.js API + local JSON data store

## Quick Start

From the repo root:

```bash
npm install
npm run dev
```

This runs both frontend and backend together.

## Common Commands

- `npm run dev`: run frontend + backend
- `npm run api`: run backend only
- `npm run dev:client`: run frontend only
- `npm run build`: build frontend
- `npm run test`: run backend tests
- `npm run typecheck`: run frontend type check

If PowerShell blocks `npm`, use `npm.cmd`.

## Demo Accounts

Password for all demo users: `demo1234`

- Admin: `admin@relief.org`
- NGO: `ngo@relief.org`
- Volunteer: `volunteer@email.com`
- Volunteer: `emily@relief.org`

## Environment

Create env files as needed:

- Server: `server/.env` (see `server/.env.example`)
- Client: `client/.env` (set `VITE_API_URL`, default `http://localhost:5001/api`)

Example server values:

```bash
PORT=5001
CORS_ORIGIN=http://localhost:5173
RELIEFSYNC_DB_PATH=/absolute/path/to/db.json
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-2.5-flash
AI_TIMEOUT_MS=8000
```
