# ReliefSync AI

ReliefSync is a full-stack relief coordination app for NGOs and volunteers. The repo is now split into two main folders:

- `client/` for the Vite + React frontend
- `server/` for the Node API and local JSON data store

## Workspace Commands

Install everything from the repo root:

```bash
npm install
```

Start both apps together:

```bash
npm run dev
```

Start only the backend API:

```bash
npm run api
```

Start only the frontend:

```bash
npm run dev:client
```

Build the frontend:

```bash
npm run build
```

Run backend tests:

```bash
npm run test
```

Run frontend type checking:

```bash
npm run typecheck
```

If PowerShell blocks `npm`, run the same commands with `npm.cmd` instead.

## Demo Accounts

All demo passwords are `demo1234`.

- Admin: `admin@relief.org`
- NGO: `ngo@relief.org`
- Volunteer: `volunteer@email.com`
- Volunteer: `emily@relief.org`

## Environment Variables

Server:

```bash
PORT=5001
CORS_ORIGIN=http://localhost:5173
RELIEFSYNC_DB_PATH=/absolute/path/to/db.json
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-2.5-flash
AI_TIMEOUT_MS=8000
```

Client:

```bash
VITE_API_URL=http://localhost:5001/api
```

The server reads Gemini credentials from `server/.env`. A ready-to-fill example is in `server/.env.example`.
