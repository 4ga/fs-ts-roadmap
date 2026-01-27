# P01 — Healthcheck API (HTTP Fundamentals)

A minimal Express + TypeScript API that demonstrates HTTP basics and a repo-wide error standard.

## Focus
- HTTP request/response lifecycle
- Status codes
- JSON responses
- Healthcheck endpoints
- Consistent error shape (`{ "error": "string" }`)

## Endpoints
- `GET /health` → `200` `{ "status": "ok" }`
- `GET /boom` → `500` `{ "error": "Internal Server Error" }`
- Unknown routes → `404` `{ "error": "Not Found" }`

## Run (dev)
```bash
npm run dev:p01
```

## Test
```bash
npm test
```

## cURL
```bash
curl -i http://localhost:3000/health
curl -i http://localhost:3000/boom
curl -i http://localhost:3000/nope
```