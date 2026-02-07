# P05 — Global Error Handler (Express + TS + Tests)

Centralized error handling for an Express + TypeScript service with a strict public error contract and request correlation.

## What this project demonstrates

### Error contract (public)

All error responses use this **single** JSON shape:

```json
{ "error": "string" }
```

Only fixed, safe public messages are returned:

| Status | Response body |
| --- | --- |
| 400 | `{ "error": "Bad Request" }` |
| 401 | `{ "error": "Unauthorized" }` |
| 403 | `{ "error": "Forbidden" }` |
| 404 | `{ "error": "Not Found" }` |
| 409 | `{ "error": "Conflict" }` |
| 429 | `{ "error": "Too Many Requests" }` |
| 500 | `{ "error": "Internal Server Error" }` |

Notes:
- No stack traces
- No internal error messages
- No extra response fields

### Not Found handler

Any unknown route returns:

- `404` with `{ "error": "Not Found" }`

### Global error middleware

A centralized `errorHandler` that:
- Catches thrown/rejected errors from routes and middleware
- Uses `HttpError` to return safe status + fixed public message
- Defaults all unknown/untrusted errors to `500` + `Internal Server Error`
- Logs real error details (including `requestId`) using the structured logger

### Request correlation (from P04)

- `requestId()` middleware:
  - Uses inbound `x-request-id` if present; otherwise generates one
  - Attaches `req.requestId`
  - Always sets response header `x-request-id` (including on error responses)

### Structured logging (from P04)

- Single-line JSON logs (stdout)
- Deterministic logger via injectable `write()` and `now()` (tested)
- Redaction of secrets in logged metadata (case-insensitive keys)

## Requirements

- Node.js
- npm

## Install

```bash
npm install
```

## Run tests

```bash
npm test
```

## Examples

### Unknown route (404)

```bash
curl -i http://localhost:3000/does-not-exist \
  -H "x-request-id: test-id-123"
```

Expected response body:

```json
{ "error": "Not Found" }
```

Response headers include:

- `x-request-id: test-id-123`

### Sample log line (single-line JSON)

```json
{
  "level": "error",
  "msg": "request error",
  "time": "2000-01-01T00:00:00.000Z",
  "requestId": "test-id-123",
  "method": "GET",
  "path": "/boom",
  "status": 500
}
```

## Redaction rules

Keys are matched case-insensitively and redacted anywhere in logged metadata:

- `authorization`
- `cookie`
- `set-cookie`
- `password`
- `token`
- `accessToken`
- `refreshToken`

Redacted values become `"[REDACTED]"`.

## Project Structure

```text
src/
  app.ts                      # Express app wiring
  appLogger.ts                # Production logger instance (stdout + real time)
  logger.ts                   # createLogger() + redact()
  errors/
    httpError.ts              # HttpError + fixed public messages
  middleware/
    requestId.ts              # request correlation middleware
    httpLogger.ts             # request logging middleware (logs on finish)
    notFound.ts               # 404 handler
    errorHandler.ts           # global error handler (public contract)
  types/
    express.d.ts              # adds req.requestId typing
tests/
  p05.error-contract.int.test.ts
  requestId.int.test.ts
  logger.unit.test.ts
  httpLogger.int.test.ts
```

## Standards

- No `console.log` in app code (use the logger)
- Tests are deterministic
- Error responses are always `{ "error": "string" }` with fixed public messages only
