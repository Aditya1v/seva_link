# ReliefSync AI

ReliefSync is a full-stack coordination platform for NGOs and volunteer teams. It helps convert messy, urgent community requests into prioritized tasks, then recommends the best volunteers to respond.

## Problem It Solves

Relief operations usually break down in three places:

1. Incoming requests are unstructured and hard to triage quickly.
2. Matching needs to volunteers is manual and inconsistent.
3. Teams lack a shared live view of status, workload, and impact.

ReliefSync solves this by combining role-based workflows with AI-assisted prioritization and deterministic matching.

## What The Project Does

ReliefSync supports three user roles:

1. Admin
2. NGO Coordinator
3. Volunteer

Main capabilities:

1. Authentication and role-based access control
2. Need creation from raw text input
3. Priority scoring (AI-enabled when available, rule-based fallback always available)
4. Volunteer matching with explainable scoring
5. Assignment lifecycle (pending -> accepted/rejected -> completed)
6. Dashboard insights (urgent queue, trends, active volunteers)

## How It Works End-To-End

### 1) Need Intake

An admin/NGO enters a free-text need description with optional metadata (location, category, reporter, affected people).

The backend:

1. Normalizes and validates input
2. Generates structured fields: title, category, urgency, priorityScore, summary, keywords, reason
3. Stores the need as `pending`

### 2) Priority Generation

Priority logic is resilient by design:

1. If `GEMINI_API_KEY` is set, the app attempts Gemini JSON-structured enrichment.
2. If Gemini is unavailable, times out, or errors, fallback heuristics are used automatically.

Fallback heuristics score by:

1. Category severity
2. Urgency language
3. Vulnerable-group keywords
4. Time pressure and scarcity wording
5. Number of affected people

This guarantees predictable behavior even without external AI.

### 3) Volunteer Matching

For each need, volunteers are ranked using weighted factors:

1. Skill/keyword overlap
2. Category fit
3. Location proximity
4. Availability state
5. Current workload vs capacity
6. Past category relevance

Output includes a match score and a human-readable reason, so coordinators can override intelligently.

### 4) Assignment Lifecycle

1. Coordinator assigns a volunteer to a need.
2. Volunteer accepts or rejects.
3. Need returns to `pending` if rejected.
4. Assignment can be marked `completed`, which updates need status and workload metrics.

### 5) Dashboard & Insights

Admin/NGO dashboard shows:

1. Total, pending, assigned, completed needs
2. Active volunteers
3. Urgent queue and recommended matches
4. 7-day request trend
5. Category-level insight summary

Volunteer dashboard shows:

1. Personal profile + availability
2. Current and past assignments
3. Top opportunity suggestions above threshold

## Architecture

Monorepo with two workspaces:

1. `client/`: Vite + React + TypeScript frontend
2. `server/`: Node.js (ESM) HTTP API, JSON file persistence

High-level flow:

1. React UI sends requests to `/api/*`
2. API loads DB, authenticates session token, authorizes by role
3. Service layer enriches needs and computes ranking
4. Store layer writes updates to local JSON DB
5. API returns structured responses used by dashboards and detail views

## Key Routes and User Areas

Public routes:

1. `/`
2. `/login`
3. `/signup`
4. `/forgot-password`

Protected areas:

1. `/admin/*` for `admin` and `ngo`
2. `/volunteer/*` for `volunteer`

## API Surface (Summary)

Auth:

1. `POST /api/auth/login`
2. `POST /api/auth/signup`
3. `GET /api/auth/me`

Needs:

1. `GET /api/needs`
2. `POST /api/needs`
3. `GET /api/needs/:id`
4. `PATCH /api/needs/:id`
5. `GET /api/needs/:id/matches`
6. `POST /api/needs/:id/assign`

Volunteers and assignments:

1. `GET /api/volunteers`
2. `GET /api/volunteers/me/dashboard`
3. `PATCH /api/volunteers/me`
4. `POST /api/assignments/:id/respond`
5. `PATCH /api/assignments/:id/status`

Dashboard:

1. `GET /api/dashboard`
2. `GET /api/health`

## Local Setup

### Prerequisites

1. Node.js 18+
2. npm 9+

### Start

From repo root:

```bash
npm install
npm run dev
```

This starts:

1. Frontend (Vite)
2. Backend API

## Common Commands

```bash
npm run dev          # frontend + backend
npm run api          # backend only
npm run dev:client   # frontend only
npm run build        # frontend build
npm run test         # backend tests
npm run typecheck    # frontend type checking
```

If PowerShell blocks `npm`, run the same commands with `npm.cmd`.

## Environment Configuration

No env setup is required for local development.

Defaults:

1. `PORT=5001`
2. `CORS_ORIGIN=*`
3. JSON DB path defaults to `server/data/db.json`
4. Client API URL defaults to `http://localhost:5001/api`

To customize, copy `server/.env.example` to `server/.env` and set only the values you need.

Gemini integration is optional and enabled only when `GEMINI_API_KEY` is provided.

## Demo Accounts

Password for all demo users: `demo1234`

1. Admin: `admin@relief.org`
2. NGO: `ngo@relief.org`
3. Volunteer: `volunteer@email.com`
4. Volunteer: `emily@relief.org`

## Data and Persistence

Data is persisted in a local JSON file (seeded automatically if missing). Core entities:

1. Users
2. Sessions (Bearer token auth)
3. Needs
4. Volunteers
5. Assignments

This keeps setup simple for demos and local development while preserving realistic workflows.

## Reliability Notes

1. AI enrichment is fail-safe with deterministic fallback.
2. Role guards prevent unauthorized access to privileged routes.
3. Assignment updates recalculate workload to keep matching quality stable.
4. API responses include clear error messages for invalid input and permission issues.

## Future Production Hardening

For real deployments, recommended next upgrades are:

1. Replace JSON store with managed database
2. Add robust JWT/session expiration strategy
3. Add request rate limiting and audit logging
4. Add queueing/background processing for heavy AI workloads
5. Add monitoring and alerting for dispatch-critical flows
