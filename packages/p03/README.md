# P03 — Env Config + Fail-Fast (Express + Zod + dotenv)

Centralize configuration in `src/config.ts` and validate environment variables on startup (12-factor config). The app must **fail fast** if required env vars are missing/invalid.

## What this project demonstrates

- Loads `.env` in **development** only (`dotenv`)
- Validates env vars with **Zod**
- Exports a typed `Config` shape
- Fails fast on invalid/missing env (server does not start)
- Unit tests cover valid + invalid env parsing and defaults

## Requirements

- Node.js
- npm

## Install

```bash
npm install
```

## Environment variables

Create a .env file for local development.

## Required

- DATABASE_URL — non-empty string (required)

## Optional (with defaults)

- NODE_ENV — development | test | production (default: development)

- PORT — integer 1–65535 (default: 3000)

## Local setup

Copy the example file and adjust as needed:

```bash
cp .env.example .env
```

Example .env

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://user:pass@localhost:5432/db
```

### Run (development)

```bash
npm run dev
```

#### Notes:

- In `development`, `.env` is loaded automatically.
- In `test/production`, `.env` is not loaded; you must provide env vars the environment.

### Run tests

```bash
npm test
```

### Fail-fast behavior

The server loads configuration at startup:

- If env vars are valid: the server starts and listens on `config.PORT`.
- If env vars are invalid/missing: config validation fails and the process throws before the server starts.

### Project structure

```text
src/
  app.ts        # Express app wiring (no dotenv, no process.env usage)
  config.ts     # Env schema + parsing + dev dotenv loading
  server.ts     # Startup entry (calls loadConfig() and starts the server)
tests/
  config.test.ts # Unit tests for env parsing + defaults + invalid cases
.env.example
```

### Standards

- Avoid raw `process.env.*` usage outside `src/config.ts`.
- Keep tests deterministic (no reliance on machine env).
- Validation failures should be handled by config on startup (fail-fast).

````bash

And make sure you also have this file in the same folder:

**`packages/p03/.env.example`**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://user:pass@localhost:5432/db
````
