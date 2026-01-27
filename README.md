# fs-ts-roadmap — Node/TS Fullstack Foundations (Monorepo)

A 100-project, interview-ready portfolio built with **Node.js + TypeScript**.
Each project is small, test-driven, and ships with a README + integration tests.

## What’s inside

- **Micro Projects (70):** focused reps (HTTP, validation, env config, auth basics, DB reliability, etc.)
- **Feature Projects (20):** multi-endpoint services (orders, payments, inventory, etc.)
- **Portfolio Projects (10):** full products (gateway + services + UI)

## Tech stack

- Node.js, TypeScript
- Express (early projects)
- Vitest + Supertest (integration tests)
- Docker (later phases)
- SQLite/Postgres (later phases)
- OpenAPI/Swagger docs (as projects grow)

---

## Quickstart

```bash
npm install
```

## Run a project (example: p01):

```bash
npm run dev:p01
```

## Run tests:

```bash
npm test
```

## Repo Standars (Source of Truth)

### Error shape (non-negotiable)

#### All non-2xx responses return:

```json
{ "error": "string" }
```

- No stack traces leaked to clients.

### Tests (non-negotiable)

- Every endpoint has integration tests
- Tests are deterministic (no controlled randomness/time)

### Git hygiene (non-negotiable)

- Feature branches (feature/p01-...)
- Small commits
- README required per project

### Auth standards (when applicable)

- Hashed passwords
- Short-lived access tokens
- Refresh token notation
- Logout invalidation

## Projects Index

| Project | Title                 | Focus                                | Run               |
| ------: | --------------------- | ------------------------------------ | ----------------- |
|     P01 | Healthcheck API       | HTTP + status codes + error standard | `npm run dev:p01` |
|     P02 | Validation Middleware | request validation + error shaping   | `npm run dev:p02` |
|     P03 | Env Config            | config loading + schema validation   | `npm run dev:p03` |

##### Add new projects by creating pXX/ with src/, tests/, and a README.md.

## Structure (example)

```txt
.
├─ p01/
│  ├─ src/
│  ├─ tests/
│  └─ README.md
├─ p02/
├─ p03/
├─ package.json
├─ tsconfig.json
└─ README.md
```

## Workflow (how to ship a project)

```bash
git checkout main
git pull
git checkout -b feature/p01-healthcheck

# commit in small chunks
git add p01/src
git commit -m "P01: implement health route + error handling"

git add p01/tests
git commit -m "P01: add integration tests"

git add p01/README.md
git commit -m "P01: add project README"

git push -u origin feature/p01-healthcheck

```
## License
```pgsql
MIT
```
