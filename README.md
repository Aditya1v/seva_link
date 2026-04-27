# ReliefSync AI

Hackathon-ready full-stack web app for NGOs and volunteers to collect community needs, prioritize them, rank volunteers, assign work, and let volunteers respond.

## Stack

- Frontend: Vite, React, React Router, Tailwind CSS, Recharts
- Backend: dependency-free Node HTTP API
- Storage: local JSON database seeded on first API start
- AI: optional OpenAI-compatible LLM call with deterministic fallback heuristics

## Run Locally

Install dependencies:

```bash
pnpm install
```

Start the backend API in one terminal:

```bash
pnpm api
```

Start the frontend in another terminal:

```bash
pnpm dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Demo Accounts

All demo passwords are:

```text
demo1234
```

- Admin: `admin@relief.org`
- NGO: `ngo@relief.org`
- Volunteer: `volunteer@email.com`
- Volunteer: `emily@relief.org`

## Demo Flow

1. Sign in as `ngo@relief.org`.
2. Open **Create Need** and submit messy raw request text.
3. ReliefSync structures the need, assigns urgency, gives a priority score, and explains the reason.
4. Open the need details or **Volunteer Matching** to view ranked volunteers.
5. Assign a volunteer.
6. Sign out and sign in as `volunteer@email.com`.
7. Accept or reject the assignment, then mark it completed.

## Environment Variables

Backend:

```bash
PORT=5001
CORS_ORIGIN=http://localhost:5173
RELIEFSYNC_DB_PATH=/absolute/path/to/db.json
OPENAI_API_KEY=optional
OPENAI_MODEL=optional
AI_TIMEOUT_MS=8000
```

Frontend:

```bash
VITE_API_URL=http://localhost:5001/api
```

No AI key is required for the demo. When `OPENAI_API_KEY` is missing or an LLM request fails, the backend returns deterministic heuristic results with a human-readable reason.

## API Highlights

- `POST /api/auth/login`
- `POST /api/auth/signup`
- `GET /api/dashboard`
- `GET /api/needs`
- `POST /api/needs`
- `GET /api/needs/:id`
- `PATCH /api/needs/:id`
- `GET /api/needs/:id/matches`
- `POST /api/needs/:id/assign`
- `GET /api/volunteers`
- `GET /api/volunteers/me/dashboard`
- `PATCH /api/volunteers/me`
- `POST /api/assignments/:id/respond`
- `PATCH /api/assignments/:id/status`

## Verification

```bash
pnpm test
pnpm build
```
